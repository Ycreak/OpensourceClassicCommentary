def Retrieve_data_from_db(db, selector, fields):
    """[summary]

    Args:
        db ([type]): [description]
        selector ([type]): [description]
        fields ([type]): [description]

    Returns:
        [type]: [description]
    """    
    return db.find({
            'selector': selector,
            'fields': fields,
    })   