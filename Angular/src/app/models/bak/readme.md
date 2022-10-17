Just some info on creating/editing models:

    (1): Attribute names in typescript should have the same name (not lowercase/uppercase sensitive) name, else the http requests fail with bad response
    (2): Troughout the api.service, more appropriate naming is used, like adding -ID to a name. Please try to hold to these conventions and to edit ONLY the names of the attributes in these model files, then in the API controller, model and context files and finally in the database itself.
    (3): A constructor is not always necessary, it depends on usage.
    (4): Do not send nullified fields to the API where it doesn't expect them. This will result in E400.