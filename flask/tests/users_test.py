import sys
import pytest

sys.path.append("../Server")

from common.couch import Couch
from models.user import User, UserModel


# ? No write operations here, because CouchDB can not rollback
class TestUsers:
    @pytest.fixture
    def fixture(self):
        server = Couch.connect()
        return UserModel(server.couch)

    def test_user(self):
        user = User(id="abc", username="Jantje", password="helloworld")
        assert user.id is not None
        assert user.username is not None
        assert user.password is not None
        assert user.role is None

    def test_from_json(self):
        user_json = {"id": "abc", "username": "Jantje", "password": "helloworld"}
        user = User().from_json(user_json)
        assert user.id is not None
        assert user.username is not None
        assert user.password is not None
        assert user.role is None

    def test_all(self, fixture):
        result = fixture.all()
        assert len(result) > 0

    # TODO: Think of a proper test suite
