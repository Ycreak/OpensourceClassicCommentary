from dataclasses import field

class SetFieldsetToNoneMixin:
    """Mixin to set all fields to None in dataclass"""

    def __init_subclass__(cls, **kwargs):
        for field_name, _ in cls.__annotations__.items():
            setattr(cls, field_name, field(default=None))

