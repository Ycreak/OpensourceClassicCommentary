# Open Source Classic Commentary
<img src="https://github.com/Ycreak/OpensourceClassicCommentary/blob/development/banner.png">

## About
The Open Source Classics Commentary on the Fragments of Roman Republican Tragedy is an interdisciplinary project between researchers in Classics and Computer Science.

Roman Republic tragedy presents two paradoxes: even though it was one of the most popular genres of its age, it now only survives in fragments, and even though it has profoundly influenced modern visions of Roman culture, it is still greatly understudied and inaccessible to anyone beyond a tiny minority of specialized scholars – working with textual fragments is extremely complex. This project will help introduce non-specialists to these texts, and to grasp precisely these complexities, from technical matters such as the critical apparatus and metrical analysis, to the role subjective editorial interpretation and contextualisation play. Editors are driven by different agendas, which can be philological, cultural or even political, affecting everything from the structuring of the fragments and their arrangement to emendations and translations. This means there is no such thing as a definitive edition, and the collation of different editions is crucial for understanding the history of the scholarship and unpicking the assumptions that shape the field today.

This database will provide a clear and accessible overview of the scholarly traditions, highlighting the differences between editions and their significance; it includes information from editions long out of print and prohibitive or difficult to obtain outside a few select universities, opening up this knowledge to a broader public; it allows the user to view the arrangements of previous editions and to play with possible arrangements, producing new insights into the text; finally, scholars and students are able to add content to the database, enabling greater collaboration in the field. Until now, there has been no tool to work actively and dynamically with the different editions and arrangements of fragments. This database makes this possible.

### Table of Contents  
+ [Project Overview](#Requirements)  
+ [Angular Frontend](#Dataset)  
+ [Flask API](#CRF)  
+ [CouchDB Database](#LSTM)  

<a name="Requirements"/>

## Getting started
See [the manual]() and the [Fragment component overview](#Fragment_component) on how to work with the OSCC.

## Project overview
The project consists of three parts. A frontend written with Angular, an API written with Flask and a NoSQL database powered by Apache CouchDB. Below a diagram of the program. The next sections will describe each of the three parts and their subcomponents.

<img src="https://github.com/Ycreak/OpensourceClassicCommentary/blob/development/project_overview_2.png" width="100%">

## Angular Frontend
The frontend is written with Angular and allows the user to interact with the fragments. 

### Installation
To install and run the Angular component on your PC, make sure to have [NodeJS](https://nodejs.org/en/) and [NPM](https://www.npmjs.com/) installed on your machine. Next, navigate to the Angular folder and run the following commands in your terminal:

```console 
npm install --save @angular/material @angular/cdk
npm install --save bootstrap
npm install --save jquery
npm install
```

The Angular component can now be hosted using the following command (make sure to be in the Angular folder):

```console 
ng serve --poll=3000 --port 4200
```

Of course, the port can be changed to suit your needs. The poll option denotes the number of files that can be watched on changes to automatically reload the frontend when developing. If the size of the project increases and if the console asks for this, the number should be increased.

The website will now be hosted on the local host and can be accessed via any javascript-capable browser via [https://localhost:4200](https://localhost:4200).

### Dependencies
The project aims at using as few dependencies as possible. At the moment, the following dependencies are used:
+ angular-onscreen-material-keyboard : ^0.4.0
+ insert-text-at-cursor : ^0.3.0a
+ @angular/forms : ^10.1.6
+ @angular/material : ^10.2.7
+ @angular/router : ^10.1.6

A complete list including version numbers can be found in the [Angular documentation]().

### Components
The project consists of two main components, being the Fragments component and the Dashboard components. All components and services are described below.

<a name="Fragment_component"/>

#### Fragments
The Fragments component allows the user to work with the Latin fragments. It has three distinct parts, as shown in the project overview.

1. The fragment columns show the fragments from the selected author and text, which can be selected using drop down menus at the top of each column. Up to four fragment columns can be shown and removed using the corresponding buttons in the navigation bar. It furthermore allows the user to move fragments up and down to change the order of the text. Lastly, fragments can be clicked to retrieve their commentary, which is shown in the commentary column. When no commentary exists for the clicked fragment, commentaries from linked fragments will be retrieved if available. If a fragment is linked to fragments shown in other columns, these linked fragments will be highlighted in pink.

2. The commentary column shows the commentary corresponding to the clicked fragment. It retrieves six data fields: translation, apparatus criticus, editorial differences, citation context, commentary and reconstruction. Each field can be expanded and collapsed at will. In contrast to the other data fields, a fragment can have multiple citation contexts, which will have their own expansion panel. For example, the fragment will have one translation, but can have a context by Cicero and one by Nonius.

3. The playground is located beneath the fragment and commentary columns and allows the user to move the fragments around in two dimensions. Additonally, it is possible to put fragments from different texts together. Lastly, the user can add notes to organise fragments and thoughts within the playground.

#### Dashboard
The Dashboard component allows users to add, edit and remove fragment and user data. There are two distinct parts:

1. The _Change Fragment Data_ expansion panel allows the user to create, revise and delete fragments. Via the drop down menus in the top the fragment can be selected via its author, text and edition. Six tabs are then presented to the user. The first allows for the editing of fragment meta data. The second tab allows for the revision of fragment lines, with the third and forth being used for editing the commentary (content and context). The fifth tab is used for linking the selected fragment to fragments from other texts and editions. The last tab allows administrators to lock a fragment or text, as to disallow any further changes by users. Three buttons are provided. The first one creates a new fragment given the provided meta data. The second one revises the selected fragment given the changes in meta data, content, context and so on. The last button allows the user to delete the selected fragment.

2. The _Change User Data_ expansion panel allows the user to change user data. 

#### Auth
#### Login
#### Text
#### Dialogs
#### Services
##### Utility
##### API


## Flask API

## CouchDB Backend
