"""
Tests for `common.validation.parse_document_request`.

The validator is the single seam where /document endpoints reject
malformed bodies before they reach a model — these tests pin down both
the happy path (one assertion per document_type) and the rejection
cases (unknown filter key, unknown document_type, missing required
field, non-dict body) so future refactors of the whitelist or the
required-field plumbing fail loudly.
"""

import pytest

from common.validation import parse_document_request


class TestParseDocumentRequestHappyPath:
    """Each document_type should accept a legitimate field from its model."""

    def test_fragment_filter_strips_document_type(self):
        body = {
            "sandbox": "admin",
            "document_type": "fragment",
            "author": "Ennius",
            "title": "Thyestes",
        }
        req = parse_document_request(body, require=("document_type",))
        assert req.document_type == "fragment"
        assert req.sandbox == "admin"
        # `filter` is the body minus document_type — used for model.get
        assert req.filter == {
            "sandbox": "admin",
            "author": "Ennius",
            "title": "Thyestes",
        }
        # `payload` is the body verbatim — used for model.create/update
        assert req.payload == body

    def test_introduction_accepts_editor_field(self):
        body = {
            "sandbox": "admin",
            "document_type": "introduction",
            "editor": "Skutsch",
        }
        req = parse_document_request(body)
        assert req.document_type == "introduction"
        assert req.filter == {"sandbox": "admin", "editor": "Skutsch"}

    def test_testimonium_accepts_witness_field(self):
        body = {
            "sandbox": "admin",
            "document_type": "testimonium",
            "witness": "Cicero",
        }
        req = parse_document_request(body)
        assert req.document_type == "testimonium"
        assert req.filter == {"sandbox": "admin", "witness": "Cicero"}

    def test_playground_accepts_created_by_field(self):
        body = {
            "sandbox": "admin",
            "document_type": "playground",
            "created_by": "alice",
        }
        req = parse_document_request(body)
        assert req.document_type == "playground"
        assert req.filter == {"sandbox": "admin", "created_by": "alice"}


class TestParseDocumentRequestRejections:
    """The validator should refuse anything the endpoints can't honour."""

    def test_rejects_unknown_filter_key(self):
        body = {
            "sandbox": "admin",
            "document_type": "fragment",
            "authr": "Ennius",  # typo
        }
        with pytest.raises(ValueError, match="authr"):
            parse_document_request(body)

    def test_rejects_unknown_document_type(self):
        body = {"sandbox": "admin", "document_type": "poem"}
        with pytest.raises(ValueError, match="poem"):
            parse_document_request(body)

    def test_rejects_missing_required_field(self):
        # sandbox is in the default `require` set, but be explicit so the
        # test pins the require= contract too.
        body = {"document_type": "fragment"}
        with pytest.raises(ValueError, match="sandbox"):
            parse_document_request(body, require=("sandbox", "document_type"))

    def test_rejects_missing_required_document_type(self):
        body = {"sandbox": "admin"}
        with pytest.raises(ValueError, match="document_type"):
            parse_document_request(body)

    def test_rejects_none_body(self):
        with pytest.raises(ValueError, match="JSON object"):
            parse_document_request(None)

    def test_rejects_list_body(self):
        with pytest.raises(ValueError, match="JSON object"):
            parse_document_request([{"sandbox": "admin"}])
