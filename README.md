# Open Source Classic Commentary
<img src="https://github.com/Ycreak/OpensourceClassicCommentary/blob/development/banner.png">

## About
The Open Source Classics Commentary on the Fragments of Roman Republican Tragedy is an interdisciplinary project between researchers in Classics and Computer Science.

Roman Republic tragedy presents two paradoxes: even though it was one of the most popular genres of its age, it now only survives in fragments, and even though it has profoundly influenced modern visions of Roman culture, it is still greatly understudied and inaccessible to anyone beyond a tiny minority of specialized scholars – working with textual fragments is extremely complex. This project will help introduce non-specialists to these texts, and to grasp precisely these complexities, from technical matters such as the critical apparatus and metrical analysis, to the role subjective editorial interpretation and contextualisation play. Editors are driven by different agendas, which can be philological, cultural or even political, affecting everything from the structuring of the fragments and their arrangement to emendations and translations. This means there is no such thing as a definitive edition, and the collation of different editions is crucial for understanding the history of the scholarship and unpicking the assumptions that shape the field today.

This database will provide a clear and accessible overview of the scholarly traditions, highlighting the differences between editions and their significance; it includes information from editions long out of print and prohibitive or difficult to obtain outside a few select universities, opening up this knowledge to a broader public; it allows the user to view the arrangements of previous editions and to play with possible arrangements, producing new insights into the text; finally, scholars and students are able to add content to the database, enabling greater collaboration in the field. Until now, there has been no tool to work actively and dynamically with the different editions and arrangements of fragments. This database makes this possible.

### Table of Contents  
+ [Getting Started](#get_started)  
+ [Project Overview](#project_overview)  
+ [Angular Frontend API](#angular)  
+ [Flask API](#flask)  
+ [CouchDB Database](#couchdb)  
+ [Project Deployment](#deployment)  

<a name="get_started"/>

## Getting started
See [the manual]() and the [Fragment component overview](#Fragment_component) on how to work with the OSCC.

<a name="project_overview"/>

## Project overview
The project consists of three parts. A frontend written with Angular (client-sided), an API written with Flask (server-sided) and a NoSQL database powered by Apache CouchDB. Below a diagram of the program. The next sections will describe each of the three parts and their subcomponents.

<img src="https://github.com/Ycreak/OpensourceClassicCommentary/blob/development/project_overview_2.png" width="100%">

<a name="angular"/>

## Angular Frontend
The frontend is written with Angular and allows the user to interact with the fragments. 

### Installation
To install and run the Angular component on your PC, make sure to have [NodeJS](https://nodejs.org/en/) and [NPM](https://www.npmjs.com/) installed on your machine. Next, navigate to the Angular folder and run the following commands in your terminal:

```console 
sudo npm install -g @angular/cli
npm install --save @angular/material @angular/cdk bootstrap jquery
npm install
```

The Angular component can now be hosted using the following command (make sure to be in the Angular folder):

```console 
ng serve --poll=3000 --port 4200
```

Of course, the port can be changed to suit your needs. The poll option denotes the number of files that can be watched on changes to automatically reload the frontend when developing. If the size of the project increases and if the console asks for this, the number should be increased.

The website will now be hosted on the local host and can be accessed via any javascript-capable browser via [https://localhost:4200](https://localhost:4200).

To keep the project up to date, use [Angular's update guide](https://update.angular.io/). Make sure to also update the dependencies listed in package.json using npm-check-updates. In the Angular folder, issue the following commands:

```console 
npm i -g npm-check-updates
ncu -u
npm install
```

The project also uses Prettier and ESLint for better code practises and easier cooperation between programmers.

```console
npm install --save-dev --save-exact prettier


```

To run Prettier:
```console
npx prettier --check .
npx prettier --write .
```

### Dependencies
The project aims at using as few dependencies as possible. At the moment, the following dependencies are used:
+ angular-onscreen-material-keyboard : ^0.4.0
+ insert-text-at-cursor : ^0.3.0a
+ @angular/forms : ^10.1.6
+ @angular/material : ^10.2.7
+ @angular/router : ^10.1.6
+ ngx-simple-text-editor

A complete list including version numbers can be found in the [Angular documentation]().

#### Rich Text Editor
The OSCC allows the user to edit fragments via a rich text editor. This editor is invoked via the buttons called *Rich Text*, which starts the ngx-simple-text-editor. In short, the text field including its HTML formatting is given to the editor via the dialog service. This opens a new dialog and the WYSIWYG editor. When closing the editor, the updated text field is send back in plain HTML to be used in the Dashboard for example. The editor is programmed in such a way that it is easily swapped out by a new one if the ngx-simple-text-editor dependency breaks. Additionally, the OSCC will still be functional without the editor, though restricting the user to editing in plain HTML.

### Components
The project consists of two main components, being the Fragments component and the Dashboard components. All components and services are described below. As a whole, the project is built using the elements from the Angular Material library.

<a name="Fragment_component"/>

#### Fragments
The Fragments component allows the user to work with the Latin fragments. It has three distinct parts, as shown in the project overview.

1. The fragment columns show the fragments from the selected author and text, which can be selected using drop down menus at the top of each column. Up to four fragment columns can be shown and removed using the corresponding buttons in the navigation bar. It furthermore allows the user to move fragments up and down to change the order of the text. Lastly, fragments can be clicked to retrieve their commentary, which is shown in the commentary column. When no commentary exists for the clicked fragment, commentaries from linked fragments will be retrieved if available. If a fragment is linked to fragments shown in other columns, these linked fragments will be highlighted in pink.

2. The commentary column shows the commentary corresponding to the clicked fragment. It retrieves six data fields: translation, apparatus criticus, editorial differences, citation context, commentary and reconstruction. Each field can be expanded and collapsed at will. In contrast to the other data fields, a fragment can have multiple citation contexts, which will have their own expansion panel. For example, the fragment will have one translation, but can have a context by Cicero and one by Nonius.

3. The playground is located beneath the fragment and commentary columns and allows the user to move the fragments around in two dimensions. Additonally, it is possible to put fragments from different texts together. Lastly, the user can add notes to organise fragments and thoughts within the playground.

#### Dashboard
The Dashboard component allows users to add, edit and remove fragment and user data. There are two distinct parts:

1. The _Change Fragment Data_ expansion panel allows the user to create, revise and delete fragments. Via the drop down menus in the top the fragment can be selected via its author, text and edition. Six tabs are then presented to the user. The first allows for the editing of fragment meta data. The second tab allows for the revision of fragment lines, with the third and forth being used for editing the commentary (content and context). The fifth tab is used for linking the selected fragment to fragments from other texts and editions. The last tab allows administrators to lock a fragment or text, as to disallow any further changes by users. Three buttons are provided. The first one creates a new fragment given the provided meta data. The second one revises the selected fragment given the changes in meta data, content, context and so on. The last button allows the user to delete the selected fragment.

2. The _Change User Data_ expansion panel allows the user to change user data. It consists of a table with all users that the current user is allowed to edit. When clicking on an entry of the table, the user can change their name and/or password. Administrators can also create and delete users, and change their roles. 

#### Login
The Login component allows a user to login and access user features such as the dashboard. It is a simple dialog window with two options:

1. Login of current user. This allows the user to login with an existing account.
2. Creation of new user. This allows anyone to create a new account by providing a username and password. As the project is currently invite only, a magic word created by the administrators is needed to create an account.

The Login component only handles the dialog window and its input (including sanitation). The communication with the API is handled via the Auth service, which is invoked by the Login component. See below.

#### Text
(deprecated)

#### Dialogs
The folder Dialogs contains html files with templates that can be included in a dialog from anywhere within the project. At the moment, the following dialogs exist:
 
1. About. Relates the about information for the project. Is currently included in the Fragments component and accessible from the Navbar Menu.
  
#### Services
The project contains multiple services that can be invoked from anywhere within the project. OSCC uses the following services:

##### API
The API service handles all communication with the Flask backend. As with the Dashboard, it handles fragment and user data requests via GET. Additionally, requests to add, revise and delete fragments and users are handled via POST. Any retrieved data will be automatically put into models for easy access. For example, a retrieved JSON with fragment data will be automatically put in the Typescript object called Fragment. The service also includes a listener for any server errors, which will be displayed to the user via the Snackbar functionality. In essence, each component requests the API for data. The API will then handle the actual communication with the backend. All functionalities can be found in the [Angular documentation]().
  
##### Auth
The Auth service handles the authentication of users. This component is invoked by the Login component and saves the information regarding the current user (name, role, etc.). This data is used by the Fragments and Dashboard components to know the privileges of the user. For example, if the user is a student, the button for fragment deletion will be disabled.

##### Utility
The utility service contains basic functions that can be used by any component. For example, a function exists to easily filter an object given a key, or to show an error message received from the server in a snackbar popup. For all available functions and their documentation, see the [Angular documentation]().
  
<a name="flask"/>
  
## Flask API
Flask handles all incoming requests from Angular. It is important to note that the API does not trust the incoming data and will sanitise everything without exception. After fulfilling a request, data is sent back to Angular using the JSON format.
  
### Installation
To use the Flask framework, navigate to the Server folder and create a Python environment and install all dependencies using pip:  
  
```console 
pip install -r requirements.txt
```  
  
The next order of business is to start the server using the following command:

```console 
FLASK_APP=server.py FLASK_ENV=development flask run --port 5003
```
  
This command runs the server in development mode and creates a watcher that will reload the server whenever a change is made to the code. Of course, the port can be changed. Make sure that Angular communicates with the correct address and port. Additionally, port forwarding might be needed when communicating to a server outside the local network.

_NOTE: communication with the server is encrypted and uses SSL and HTTPS. Make sure to have valid certificates whenever deploying the server. SSL can be disabled by removing the **ssl_context** option in server.py. Although this is acceptable for developing practises, SSL should be enabled for production._

### Dependencies
The server uses the following Python-pip dependencies (the exact versions can be found in the [Flask documentation]()):

+ numpy
+ flask
+ flask_cors
+ flask_restful (deprecated)
+ flask_jsonpify
+ couchdb
+ jsonpickle
+ fuzzywuzzy  
  
### Components
The server has two functionalities: managing fragment information and managing user information. All data entering the server is handled in _server.py_. Based on the called function, information is sanitised and forwarded to _Fragment_handling.py_ or _User_handling.py_. Whenever one of these classes has processed the data and communicated with the database, the data is packed in a JSON and returned to Angular.

#### Fragment Handling
Fragment Handling receives a sanitised object called Fragment from the server alongside instructions on what to do with the object. This class will establish communication with the database. Next, it will return the Fragment object with the requested information to the calling class. All functions and their descriptions can be found in the [Flask documentation]().

#### User Handling
User Handling receives a sanitised object called User from the server alongside instructions on what to do with the object. This class will establish communication with the database. Next, it will return the User object with the requested information to the calling class. All functions and their descriptions can be found in the [Flask documentation]().

### Communication overview
The communication between frontend and API is done via two models: Fragment and User. The communication looks as follows: in Angular a Typescript Object is created called Fragment. In the API component this object is turned into a JSON object and sent to Flask. After validation the JSON object is deserialized into a Python object. This structuring ensures a predictability of sent and received data between API and frontend and a simple programming structure for the API. In essence, both Typescript and Python work with their respective objects, with the API services taking care of the communication via JSON and HTTPS. The downside of this approach is the excess of data transferred. For example, when changing a user's password, an empty role field will be transferred instead of the required fields *username* and *new_password*. To illustrate:

<img src="https://github.com/Ycreak/OpensourceClassicCommentary/blob/development/project_overview_api.png">


<a name="couchdb"/>

## CouchDB Backend
The database is powered by Apache CouchDB and is therefore a NoSQL database. The benefit of this approach is that each fragment is a document with all its information contained in a single JSON. Likewise, each User is a document accompanied by its information. This allows for easy backup and storage, as we can simply store the Fragment documents on any server or repository. Other researchers can then easily download the dataset and use it for other purposes by opening the JSON files. 

### Installation
The installation of the database is operating specific. Please consult the [CouchDB website](https://couchdb.apache.org/) for more information. If installed correctly, creating two tables called **Users** and **Fragments** will allow the server to communicate correctly with the database.

### Tables
The database contains the following tables:

#### Fragment Table
The Fragment table contains documents representing each fragment. Stored in JSON format, it contains the following fields:

+ _id: contains the identifier of the document/fragment.
+ fragment_name: represents the name of the fragment in string format.
+ author: represents the original author of the text in which the fragment occurs according to the given editor.
+ title: represents the original text to which the fragment is attributed by the editor.
+ editor: represents the name of the editor that related the fragment in question.
+ translation: represents the translation of the fragment.
+ differences: represents the editorial differences of the fragment.
+ apparatus: represents the apparatus criticus of the fragment.
+ commentary: represents the commentary of the fragment.
+ reconstruction: represents the reconstruction of the fragment.
+ status: represents the status of the fragment: _certum, incertum_ or _indespota_.
+ context: used for a list with various contexts in which the fragment is found. Each context entry contains the following fields:
  * context author: contains the author of the context in which the fragment is found.
  * location: contains the location (text or title) in which the fragment is found.
  * text: contains the text in which the fragment is found.
+ lines: contains a list representing all lines of the fragment. Each entry contains the following fields:
  * line number: contains the name of the line.
  * text: contains the actual content of the line.
+ linked_fragments: contains a list of all linked fragments. This linking is done via the identifier of other fragments.
+ lock: contains an integer denoting whether a fragment is locked for editing.

#### Users Table
The Users table contains documents representing each user. Stored in JSON format, it contains the following fields:

+ _id: contains the identifier of the document/fragment.
+ username: contains the username of the user.
+ password: contains the hashed password of the user. Hashing is done using sha512 with added salt, with only the hash being stored.
+ role: contains the role of the user. Current roles are _admin, teacher, student and guest_.

<a name="deployment"/>

## Deployment of the Project
To build Angular, run the following command when inside the Angular folder:

```console 
ng build
```

If the program is ran from a subdomain, do not forget to specify said domain. For example: --base-href=/OSCC/
The production can now be found in Angular/dist and is ready for deployment on an HTML server.

Checklist before building:
+ Check if the version number is updated
+ Check if the build is Staging or Stable
+ Check if the correct API URL has been used
+ Run the Server Communication Tests in the testing component (localhost:4200/tests)
+ Run the unit tests with ng test
+ Check if AuthService does not login automatically
