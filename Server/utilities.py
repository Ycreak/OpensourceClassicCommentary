# Utility functions

def Retrieve_data_from_db(db, selector, fields):
    """Function to retrieve data from the given database using a mongoDB search query

    Args:
        db (object): database object to be searched
        selector (json): json object with data to be matched
        fields (list): specification of fields to be returned (further filtering) 

    Returns:
        [list]: of documents that fit the given search credentials 
    """
    return db.find({
            'selector': selector,
            'fields': fields,
            'limit': 1000
    })
