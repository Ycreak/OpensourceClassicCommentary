"""
Validation helpers for /document endpoints.

Centralizes body parsing, required-field checks, and per-document_type
field whitelisting so endpoints can fail fast with a clear 422 message
instead of silently dropping unknown keys downstream.
"""

from dataclasses import dataclass, field
from typing import Iterable, Optional


# Keys accepted in a request body per document_type. Mirrors the
# `*Fields` constants in models/{introduction,fragment,testimonium,
# playground}.py. Kept inline (rather than imported from models) so
# the validator has no couchdb / db dependency and can be unit-tested
# in isolation. If model fields change, update this map.
_ALLOWED_FIELDS: dict[str, frozenset[str]] = {
    "introduction": frozenset({
        "_id", "document_type", "author", "title", "editor", "text", "sandbox",
    }),
    "fragment": frozenset({
        "_id", "document_type", "name", "author", "title", "editor", "status",
        "lock", "visible", "translation", "popular_translation", "differences",
        "apparatus", "commentary", "reconstruction", "metrical_analysis",
        "context", "lines", "linked_fragments", "sandbox",
    }),
    "testimonium": frozenset({
        "_id", "document_type", "name", "author", "title", "translation",
        "witness", "text", "editor", "sandbox", "lock", "visible",
    }),
    "playground": frozenset({
        "_id", "document_type", "canvas", "created_by", "name", "users",
        "sandbox",
    }),
}

VALID_DOCUMENT_TYPES: frozenset[str] = frozenset(_ALLOWED_FIELDS.keys())


@dataclass
class DocumentRequest:
    """
    A parsed and validated document-endpoint request body.

    `payload` is the original body dict, suitable for forwarding to
    model.create/update/delete which already know how to pick what
    they need. `filter` is the same dict with `document_type` removed,
    for forwarding to model.get.
    """

    sandbox: Optional[str] = None
    document_type: Optional[str] = None
    filter: dict = field(default_factory=dict)
    payload: dict = field(default_factory=dict)


def parse_document_request(
    body: Optional[dict],
    *,
    require: Iterable[str] = ("sandbox", "document_type"),
) -> DocumentRequest:
    """
    Parse a /document endpoint body. Raises ValueError on:
      - missing/non-dict body
      - missing required top-level fields (default: sandbox + document_type)
      - unknown document_type
      - filter/payload key not in the whitelist for the document_type

    The caller is expected to catch ValueError and return a 422.
    """
    if not isinstance(body, dict):
        raise ValueError("Request body must be a JSON object.")

    require = tuple(require)

    for key in require:
        if key == "document_type":
            continue  # checked below so we can also validate the value
        if not body.get(key):
            raise ValueError(f"Missing required field: {key}.")

    document_type = body.get("document_type")
    if "document_type" in require or document_type is not None:
        if not document_type:
            raise ValueError("Missing required field: document_type.")
        if document_type not in VALID_DOCUMENT_TYPES:
            raise ValueError(
                f"Unknown document_type: {document_type!r}. "
                f"Expected one of: {sorted(VALID_DOCUMENT_TYPES)}."
            )
        allowed = _ALLOWED_FIELDS[document_type] | {"sandbox", "document_type"}
        unknown = [k for k in body.keys() if k not in allowed]
        if unknown:
            raise ValueError(
                f"Unknown field(s) for document_type={document_type!r}: "
                f"{sorted(unknown)}."
            )

    filter_dict = {k: v for k, v in body.items() if k != "document_type"}

    return DocumentRequest(
        sandbox=body.get("sandbox"),
        document_type=document_type,
        filter=filter_dict,
        payload=dict(body),
    )
