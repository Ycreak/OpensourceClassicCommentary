# Open Source Classic Commentary
<img src="https://github.com/Ycreak/OpensourceClassicCommentary/blob/development/docs/banner.png">

## About
The Open Source Classics Commentary on the Fragments of Roman Republican Tragedy is an interdisciplinary project between researchers in Classics and Computer Science.

Roman Republic tragedy presents two paradoxes: even though it was one of the most popular genres of its age, it now only survives in fragments, and even though it has profoundly influenced modern visions of Roman culture, it is still greatly understudied and inaccessible to anyone beyond a tiny minority of specialized scholars – working with textual fragments is extremely complex. This project will help introduce non-specialists to these texts, and to grasp precisely these complexities, from technical matters such as the critical apparatus and metrical analysis, to the role subjective editorial interpretation and contextualisation play. Editors are driven by different agendas, which can be philological, cultural or even political, affecting everything from the structuring of the fragments and their arrangement to emendations and translations. This means there is no such thing as a definitive edition, and the collation of different editions is crucial for understanding the history of the scholarship and unpicking the assumptions that shape the field today.

This database will provide a clear and accessible overview of the scholarly traditions, highlighting the differences between editions and their significance; it includes information from editions long out of print and prohibitive or difficult to obtain outside a few select universities, opening up this knowledge to a broader public; it allows the user to view the arrangements of previous editions and to play with possible arrangements, producing new insights into the text; finally, scholars and students are able to add content to the database, enabling greater collaboration in the field. Until now, there has been no tool to work actively and dynamically with the different editions and arrangements of fragments. This database makes this possible.

### Table of Contents  
+ [Getting Started](#get_started)  
+ [Angular Frontend API](#angular)  
+ [Flask API](#flask)  
+ [CouchDB Database](#couchdb)  
+ [Project Deployment](#deployment)  

<a name="get_started"/>

## Getting started
See [the manual]() and the [Fragment component overview](#Fragment_component) on how to work with the OSCC.

To kickstart docker, run the following command:
```
docker compose up --build
```

This will install all components and packages. Later you can just do a docker compose up.

<a name="project_overview"/>

## Project overview
The project consists of three parts. A frontend written with Angular (client-sided), an API written with Flask (server-sided) and a NoSQL database powered by Apache CouchDB. Below a diagram of the program. The next sections will describe each of the three parts and their subcomponents.

<img src="https://github.com/Ycreak/OpensourceClassicCommentary/blob/development/docs/project_overview_2.png" width="100%">

<a name="angular"/>

## Angular Frontend
The frontend is written with Angular and allows the user to interact with the fragments. 

We use the [bulletproof-react](https://github.com/alan2207/bulletproof-react/tree/master) standards for this project.

### Installation
To install and run the Angular component on your PC, make sure to have [NodeJS](https://nodejs.org/en/) and [NPM](https://www.npmjs.com/) installed on your machine. Next, navigate to the Angular folder and run the following commands in your terminal:

```console 
sudo npm install -g @angular/cli
npm install
```

The Angular component can now be hosted using the following command (make sure to be in the Angular folder):

```console 
ng serve
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

To run ESLint:
```console
npm run lint
```

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

<a name="couchdb"/>

## CouchDB Backend
The database is powered by Apache CouchDB and is therefore a NoSQL database. The benefit of this approach is that each fragment is a document with all its information contained in a single JSON. Likewise, each User is a document accompanied by its information. This allows for easy backup and storage, as we can simply store the Fragment documents on any server or repository. Other researchers can then easily download the dataset and use it for other purposes by opening the JSON files. 

### Installation
The installation of the database is done with Docker. Having started Docker, go to `http://localhost:5984/_utils/#/replication` and create a replication for each table. The source will be a remote database, with the url being http://nolden.biz:5984/<table_name>. Retrieve the username and password from the administrator. The table names can be found in the Flask API.

<a name="deployment"/>

## Deployment of the Project
To build Angular, run the following command when inside the Angular folder:

```console 
ng build
rsync -avu dist/OpenSourceClassicCommentary/* <server>:<location>
```

If the program is ran from a subdomain, do not forget to specify said domain. For example: --base-href=/OSCC/
