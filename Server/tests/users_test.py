import sys
import pytest

sys.path.append("../Server")

from couch import CouchAuthenticator
from models.user import User, UserModel

#? No write operations here, because CouchDB can not rollback
class TestUsers:
    @pytest.fixture
    def fixture(self):
        server = CouchAuthenticator()
        return UserModel(server.couch)

    def test_user(self):
        user = User(id="abc", username="Jantje", password="helloworld")
        assert user.id != None
        assert user.username != None
        assert user.password != None
        assert user.role == None
    
    def test_from_json(self):
        user_json = {
            "id": "abc",
            "username": "Jantje",
            "password": "helloworld"
        }
        user = User().from_json(user_json)
        assert user.id != None
        assert user.username != None
        assert user.password != None
        assert user.role == None

    def test_all(self, fixture):
        result = fixture.all()
        assert len(result) > 0
    
    # TODO: Think of a proper test suite