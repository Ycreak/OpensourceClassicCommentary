openapi: 3.0.0
servers:
  # Added by API Auto Mocking Plugin
  - description: SwaggerHub API Auto Mocking
    url: https://virtserver.swaggerhub.com/PPBORS_1/OSCC/1.0.0
info:
  version: "1.0.0"
  title: oscc-api
  description: The API for the OSCC project
paths:
  '/user/get':
    post:
      tags:
        - User
      operationId: get
      parameters:
        - in: query
          name: username
          description: the username of the user making the call
          required: true
          schema:
            type: string
      responses:
        '200':
          description: list of users allowed to see
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/get_user_response'
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/retrieve_user'
  
  '/user/create':
    post:
      tags:
        - User
      operationId: create
      parameters:
        - in: query
          name: username
          description: the username of the new user
          required: true
          schema:
            type: string
        - in: query
          name: password
          description: password of the new user
          required: true
          schema:
            type: string
      responses:
        '201':
          description: OK
        '403':
          description: forbidden
        '500':
          description: server error
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/create_user'
              
  '/user/update':
    post:
      tags:
        - User
      operationId: update
      parameters:
        - in: query
          name: username
          description: the username of the user to update
          required: true
          schema:
            type: string
        - in: query
          name: password
          description: the new password
          required: false
          schema:
            type: string
        - in: query
          name: role
          description: the new role
          required: false
          schema:
            type: string
            enum:
              - guest
              - student
              - teacher
              - admin
      responses:
        '201':
          description: OK
        '422':
          description: unprocessable entity
        '401':
          description: not found
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/update_user'
  '/user/delete':
    post:
      tags:
        - User
      operationId: delete
      parameters:
        - in: query
          name: username
          description: the username of the user to delete
          required: true
          schema:
            type: string
      responses:
        '200':
          description: OK
        '422':
          description: unprocessable entity
        '401':
          description: not found
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/delete_user'
  
  '/user/login':
    post:
      tags:
        - User
      operationId: login
      parameters:
        - in: query
          name: username
          description: the username of the user
          required: true
          schema:
            type: string
        - in: query
          name: password
          description: the password of the user
          required: true
          schema:
            type: string
      responses:
        '200':
          description: OK
        '403':
          description: unauthorized
        '401':
          description: not found
        '422':
          description: unprocessable entity
        '500':
          description: server error
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/login_user'

  '/fragment/get':
    post:
      tags:
        - Fragment
      operationId: get_fragment
      parameters:
        - in: query
          name: author
          description: the author of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: title
          description: the title of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: editor
          description: the editor of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: fragment_name
          description: the name of the fragment
          required: false
          schema:
            type: string
      responses:
        '200':
          description: list of fragments based on request query
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/get_fragment_response'
        '401':
          description: not found
        '422':
          description: unprocessable entity
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/get_fragment'
              
  '/fragment/get/author':
    post:
      tags:
        - Fragment
      operationId: get_fragment_author
      parameters:
        - in: query
          name: author
          description: the author of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: title
          description: the title of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: editor
          description: the editor of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: fragment_name
          description: the name of the fragment
          required: false
          schema:
            type: string
      responses:
        '200':
          description: list of unique authors based on query
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/get_fragment_author_response'
        '401':
          description: not found
        '422':
          description: unprocessable entity
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/get_fragment_author'
              
  '/fragment/get/title':
    post:
      tags:
        - Fragment
      operationId: get_fragment_title
      parameters:
        - in: query
          name: author
          description: the author of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: title
          description: the title of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: editor
          description: the editor of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: fragment_name
          description: the name of the fragment
          required: false
          schema:
            type: string
      responses:
        '200':
          description: list of unique titles based on query
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/get_fragment_title_response'
        '401':
          description: not found
        '422':
          description: unprocessable entity
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/get_fragment_title'
              
  '/fragment/get/editor':
    post:
      tags:
        - Fragment
      operationId: get_fragment_editor
      parameters:
        - in: query
          name: author
          description: the author of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: title
          description: the title of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: editor
          description: the editor of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: fragment_name
          description: the name of the fragment
          required: false
          schema:
            type: string
      responses:
        '200':
          description: list of unique editors based on query
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/get_fragment_editor_response'
        '401':
          description: not found
        '422':
          description: unprocessable entity
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/get_fragment_author'
  
  '/fragment/get/name':
    post:
      tags:
        - Fragment
      operationId: get_fragment_name
      parameters:
        - in: query
          name: author
          description: the author of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: title
          description: the title of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: editor
          description: the editor of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: fragment_name
          description: the name of the fragment
          required: false
          schema:
            type: string
      responses:
        '200':
          description: list of unique names based on query
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/get_fragment_name_response'
        '401':
          description: not found
        '422':
          description: unprocessable entity
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/get_fragment_name'

  '/fragment/create':
    post:
      tags:
        - Fragment
      operationId: create_fragment
      parameters:
        - in: query
          name: author
          description: the author of the fragment
          required: true
          schema:
            type: string
        - in: query
          name: title
          description: the title of the fragment
          required: true
          schema:
            type: string
        - in: query
          name: editor
          description: the editor of the fragment
          required: true
          schema:
            type: string
        - in: query
          name: fragment_name
          description: the name of the fragment
          required: true
          schema:
            type: string
        - in: query
          name: status
          description: the status of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: lock
          description: the lock on the fragment
          required: false
          schema:
            type: string
            enum:
              - "0"
              - "1"
        - in: query
          name: translation
          description: the translation of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: differences
          description: the differences of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: apparatus
          description: the apparatus of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: commentary
          description: the commentary of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: reconstruction
          description: the reconstruction of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: context
          description: the context of the fragment
          required: false
          schema:
            type: string
        - in: query
          name: lines
          description: the lines of the fragment
          required: false
          schema:
            type: array
            items:
              type: string
        - in: query
          name: linked_fragments
          description: the linked fragment id's of the fragment
          required: false
          schema:
            type: string
      responses:
        '200':
          description: OK
        '401':
          description: not found
        '422':
          description: unprocessable entity
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/create_fragment'
              
          

          

components:
  schemas:
    create_user:
      type: object
      properties:
        username:
          type: string
          example: Lucus
        password:
          type: string
          example: Ennius123!

    retrieve_user:
      type: object
      properties:
        username:
          type: string
          example: 'Lucus'
          
    update_user:
      type: object
      properties:
        username:
          type: string
          example: Lucus
        password:
          type: string
          example: helloworld
        role:
          type: string
          example: student
          
    delete_user:
      type: object
      properties:
        username:
          type: string
          example: 'Lucus'
    
    login_user:
      type: object
      properties:
        username:
          type: string
          example: 'Lucus'
        password:
          type: string
          example: 'Ennius123'
          
    get_user_response: 
      type: array
      items: 
        $ref: '#/components/schemas/UserModel'
      example: 
        - id: null
          username: Lucus
          password: null
          role: teacher
        - id: null
          username: Philippus
          password: null
          role: student
        - id: null
          username: Antjus
          password: null
          role: teacher
    
    get_fragment_response:
      type: array
      items:
        $ref: '#/components/schemas/FragmentModel'
      example:
        - id: a6ef371d7486426d93658a72604955f1
          fragment_name: "5"
          author: Ennius
          title: Thyestes
          editor: Ribbeck
          status: Certum
          lock: "1"
          translation: ""
          differences: ""
          apparatus: ""
          commentary: ""
          reconstruction: ""
          context: []
          lines: [{"line_number": "299", "text": "impetrem (fac) facile ab animo ut cernat vitalem"}, {"line_number": "300", "text": "abigeum"}]
          linked_fragments: []
    
    get_fragment_name:
      type: object
      properties:
        author:
          type: string
          example: Ennius
        title:
          type: string
          example: Thyestes
        editor:
          type: string
          example: Ribbeck
          
    get_fragment_name_response:
      type: array
      items:
        type: string
      example: ["8", "5", "38", "7", "9", "37", "1", "30", "57", "4", "11", "10", "36", "3", "2", "6"]
        
    get_fragment_title:
      type: object
      properties:
        author:
          type: string
          example: Ennius
    
    get_fragment_title_response:
      type: array
      items:
        type: string
        example: Thyestes
        
    get_fragment_author:
      type: object
      properties:
        title:
          type: string
          example: Thyestes

    get_fragment_author_response:
      type: array
      items:
        type: string
        example: Ennius

    get_fragment_editor_response:
      type: array
      items:
        type: string
      example: ["Ribbeck", "Vahlen", "TRF", "Warmington","Jocelyn"]
        
    get_fragment:
      type: object
      properties:
        author:
          type: string
          example: Ennius
        title:
          type: string
          example: Thyestes
        editor:
          type: string
          example: Ribbeck
        fragment_name:
          type: string
          example: 5
          
    create_fragment:
      type: object
      properties:
        author:
          type: string
          example: Philippus
        title:
          type: string
          example: Hades
        editor:
          type: string
          example: Editorianus
        fragment_name:
          type: string
          example: 99
      
    
    UserModel:
      type: object
      properties:
        id:
          type: string
        username:
          type: string
        password:
          type: string
        role:
          type: string
    
    FragmentModel:
      type: object
      properties:
        id:
          type: string
        fragment_name:
          type: string
        author:
          type: string
        title:
          type: string
        editor:
          type: string
        status:
          type: string
        lock:
          type: string
        translation:
          type: string
        differences:
          type: string
        apparatus:
          type: string
        commentary:
          type: string
        reconstruction:
          type: string
        context:
          type: string
        lines:
          type: array
          items:
            type: string
        linked_fragments:
          type: array
          items:
            type: string