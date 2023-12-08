class MappingField:
    ID = "_id"


class IntroductionMappingField(MappingField):
    AUTHOR = 'selected_fragment_author'
    TITLE = 'selected_fragment_title'
    AUTHOR_TEXT = 'author_text'
    TITLE_TEXT = 'title_text'


class PlaygroundMappingField(MappingField):
    NAME = "name"
    OWNER = "owner"
    CANVAS = "canvas"
    SHARED_WITH = "shared_with"
    USER = "user"


class UserMappingField(MappingField):
    USERNAME = "username"
    PASSWORD = "password"
    ROLE = "role"


class FragmentMappingField(MappingField):
    NAME = "name"
    AUTHOR = "author"
    TITLE = "title"
    EDITOR = "editor"
    STATUS = "status"
    LOCK = "lock"
    TRANSLATION = "translation"
    DIFFERENCES = "differences"
    APPARATUS = "apparatus"
    COMMENTARY = "commentary"
    RECONSTRUCTION = "reconstruction"
    CONTEXT = "context"
    LINES = "lines"
    LINKED_FRAGMENTS = "linked_fragments"
    WITNESS = "witness"
    TEXT = "text"
    DOCUMENT_TYPE = "document_type"

class UserRole:
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"
    GUEST = "guest"

fragment_mapping = vars(FragmentMappingField)
playground_mapping = vars(PlaygroundMappingField)
introduction_mapping = vars(IntroductionMappingField)
user_mapping = vars(UserMappingField)
