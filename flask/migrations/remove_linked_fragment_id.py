"""
This migration removes the obsolete 'linked_fragment_id' field from linked fragments.

Older versions stored the couch document id of a linked fragment next to its lookup
keys. The frontend used to send a whole linked fragment as the query filter for
'document/get', so that extra key ended up in the couch selector. Because no fragment
carries 'linked_fragment_id' as a top-level field, such a selector matches nothing and
the linked documents of an affected fragment could never be retrieved. The server now
ignores non-queryable filter fields, which fixes the retrieval, but the stale field is
removed here as well so it stops travelling through the api.

The migration is idempotent and safe to re-run: it only touches fragment documents that
actually contain the field, and leaves every other field untouched.

By default this performs a dry run and only reports what it would change. Pass --apply
to write the changes. Connection settings are read from the environment (the same
COUCH_* variables used by the rest of the application) and can be overridden on the
command line, so no credentials have to be hardcoded.
"""

import argparse
import logging
import os
import sys

import couchdb
from dotenv import load_dotenv

LEGACY_FIELD = "linked_fragment_id"
MAX_CONFLICT_RETRIES = 3


class Migration:
    def __init__(
        self, host: str, port: str, user: str, password: str, db_name: str = "documents"
    ):
        self.couch = couchdb.Server(f"http://{user}:{password}@{host}:{port}/")
        self.db_name = db_name
        self.db = self.couch[db_name]
        self.docs_changed = 0
        self.links_changed = 0

    @classmethod
    def from_environment(cls, overrides: dict | None = None) -> "Migration":
        """Builds a migration from the COUCH_* environment variables.

        Args:
            overrides (dict | None): values that take precedence over the environment.
        """
        load_dotenv(".env")
        overrides = overrides or {}

        def setting(name: str, default: str) -> str:
            return overrides.get(name) or os.getenv(f"COUCH_{name.upper()}", default)

        return cls(
            host=setting("host", "localhost"),
            port=setting("port", "5984"),
            user=setting("user", "admin"),
            password=setting("password", "password"),
        )

    def change_db(self, db: str) -> None:
        self.db_name = db
        self.db = self.couch[db]

    def print_all_documents(self, db):
        for id in db:
            doc = db[id]
            print(doc)

    def strip_legacy_field(self, linked_fragments: list) -> int:
        """
        Removes the legacy field from a single list of linked fragments.

        Returns:
            int: the number of linked fragments that were modified.
        """
        removed = 0
        for linked_fragment in linked_fragments:
            if isinstance(linked_fragment, dict) and LEGACY_FIELD in linked_fragment:
                del linked_fragment[LEGACY_FIELD]
                removed += 1
        return removed

    def save_with_retry(self, doc_id: str) -> None:
        """
        Saves a document, refetching it when the revision moved on. This makes the
        migration safe to run while somebody is editing the database.

        Raises:
            RuntimeError: when the document keeps conflicting or cannot be saved.
        """
        for attempt in range(1, MAX_CONFLICT_RETRIES + 1):
            doc = self.db[doc_id]
            linked_fragments = doc.get("linked_fragments") or []
            if not self.strip_legacy_field(linked_fragments):
                return

            try:
                self.db.save(doc)
                return
            except couchdb.http.Conflict as e:
                logging.warning(
                    f"Conflict on {doc_id} (attempt {attempt}/{MAX_CONFLICT_RETRIES}): {e}"
                )
                if attempt == MAX_CONFLICT_RETRIES:
                    raise RuntimeError(
                        f"Could not save {doc_id} after {MAX_CONFLICT_RETRIES} attempts."
                    )

    def remove_linked_fragment_id(self, apply_changes: bool = False) -> None:
        """
        Removes the legacy field from all linked fragments.

        Args:
            apply_changes (bool): when False nothing is written and only a report is
                printed.
        """
        self.docs_changed = 0
        self.links_changed = 0
        affected = []

        for doc_id in self.db:
            doc = self.db[doc_id]
            if doc.get("document_type") != "fragment":
                continue

            linked_fragments = doc.get("linked_fragments") or []
            count = sum(
                1
                for item in linked_fragments
                if isinstance(item, dict) and LEGACY_FIELD in item
            )
            if count == 0:
                continue

            affected.append(
                {
                    "id": doc_id,
                    "fragment": f"{doc.get('author')} | {doc.get('title')} | {doc.get('editor')} | {doc.get('name')}",
                    "links": count,
                }
            )

            if apply_changes:
                self.save_with_retry(doc_id)

            self.docs_changed += 1
            self.links_changed += count

        self.report(affected, apply_changes)

    def report(self, affected: list, apply_changes: bool) -> None:
        """Prints a summary of the run."""
        action = "Removed" if apply_changes else "Would remove"
        print("")
        print(f"Database: {self.db_name}")
        print(
            f"Action:   {action} '{LEGACY_FIELD}' from {self.links_changed} linked fragments in "
            f"{self.docs_changed} fragment documents"
        )
        print("")

        if not affected:
            print("Nothing to do.")
            return

        print(f"{'document id':<34}{'fragment':<52}links")
        for entry in affected:
            print(f"{entry['id']:<34}{entry['fragment']:<52}{entry['links']}")

        if not apply_changes:
            print("")
            print(
                "This was a dry run, nothing was written. Re-run with --apply to make these changes."
            )


def parse_args(argv: list) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Write the changes. Without this flag the migration only reports.",
    )
    parser.add_argument("--host", default=None, help="Overrides COUCH_HOST.")
    parser.add_argument("--port", default=None, help="Overrides COUCH_PORT.")
    parser.add_argument("--user", default=None, help="Overrides COUCH_USER.")
    parser.add_argument("--password", default=None, help="Overrides COUCH_PASSWORD.")
    parser.add_argument(
        "--db", default=None, help="Database to migrate, defaults to 'documents'."
    )
    return parser.parse_args(argv)


def main(argv: list) -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    args = parse_args(argv)

    migration = Migration.from_environment(
        {
            "host": args.host,
            "port": args.port,
            "user": args.user,
            "password": args.password,
        }
    )
    if args.db:
        migration.change_db(args.db)

    try:
        migration.remove_linked_fragment_id(apply_changes=args.apply)
    except Exception as e:
        logging.error(f"Migration failed: {e}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
