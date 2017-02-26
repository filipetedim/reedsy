# Reedsy Node.js application

## Table of contents

* [Question 1](#question-1)
* [Question 2](#question-2)
* [Question 3](#question-3)
* [Question 3.1](#question-31)
* [Question 4](#question-4)
  * [Brief explanation](#brief-explanation)
  * [Setup](#setup)
  * [Guidelines](#guidelines)
* [Question 4.1](#question-41)

## Question 1
I've introduced myself a bit in the presentation letter and our emails, but I'll repeat some of it here anyway.
Personally, I'm quite a chilled out guy who likes to put out jokes and clear the mood around. I'm very curious and love being creative and learning new stuff. Not long ago I bought myself a RaspberryPi to make it into a gaming console, and stuck it inside an old PS1 case. Then I went and bought wood to make my own cat tree house, heh. I also have two cats. They're amaaazing. Best cats in the world, best cats. Huge cats. Huuuge. /referenceToEndOfWorld.

My hobbies nowadays consist of playing with my cats, watching series with my girlfriend, come up with crazy ideas to build/create stuff (like the PS1 RaspberryPi, etc), travelling around Belgium and nearby countries, and playing Resident Evil 7 with Playstation Virtual Reality goggles. I don't recommend it to the faint of heart, but it's one of the best VR experiences out there.

As for major achievements, I don't really know. For me a major achievement would be something really big, like sucessfully growing a child, or a potato crop. I've done some cool things I'm very proud of, like at 18 yo winning the national wide (Portugal) math contest, or in college being selected by others to represent the IT students in director/board/teacher meetings. I am also very proud of the NodeJS LinkedIn PDF parser I've built for skeeled, but sadly I can't share it with you.

I've already mentioned the reasons why I find Reedsy interesting in our emails, but in short, creating a tool like this is something I'd like to work on. I just like it and the idea seems really cool. Also one of the things that I liked the most was the fact that it's remote. I've been dying for a remote job, especially based on NodeJS. 

## Question 2
So I've never had any class about this in college and never did any work that actually needed operational transforming as I've never worked in any application that had real time data sharing/editing or any other situation where it can be used. Therefore I had to go and read some of this. Eureka. Now I understand the whole processing behind google docs and other real time concurrent systems.

From what I gather, the algorithm is based on cross sending information from the client and server (or multiple clients and using a server as a single source of "truth"). This cross sending, where the client sends its operation to the server, and vice-versa the server sends to the client, is what's called the Operation. The Transformation happens afterwards when the server takes the client's operation and transforms it to work with the result of its own (previous) operation, and then vice-versa in the client side.

In example, if we have the word `REEDSY` and the client and the client inserts `A` on position 1 (`RAEEDSY`) and the server deletes `R` in position `0` (`EEDSY`), the following will happen:
* The client runs the operation: `ins("A", 1)`, resulting in `RAEEDSY`
* The server runs the operation: `del("R", 0)`, resulting in `EEDSY`
* The client receives the operation the server ran (`del("R", 0)`), lets tha `0` stay `0` because its previous operation didn't affect the first char, and gets `del("R", 0)` => `AEEDSY`
* The server receives the operation the client ran (`ins("A", 1)`), transforms the `1` to `0` because it previously deleted a char, and gets `ins("A", 0)` => `AEEDSY`

Now there's certainly gaps that I don't know how to answer, or how exactly does the client/server do all that math of where it should put the number, but this is the general concept of it, from what I understood at least.

## Question 3
Once again, this is my first time with document versionning in this state. I did some re-search but couldn't find much on how to architecture it, maybe I didn't search properly. So, I'm going to go on a limb here and attempt to answer it on how I think it should be done.

I see two possible solutions, each with its pros and cons. They are.
* Saving a new document with an increased version number every time the user clicks save
* Saving the original first document, and for all future saves only save the portions edited (through operations) with increased version number (Preferred)
**Note:** I've added a note in the explanation of the second option of a reverse operation system. I think that would be the best.

### First option (Saving new documents every time)
This is my least preferred option, especially in your scope of Reedsy, as saving huge documents (books) every time would quickly increase the size of databases. And while it would be the fastest way for an user to view different versions (as it would only require a loading of said version), it would make it heavier for the bonus question (3.1), since it would have to scan both documents in its totality.

### Second option (Saving portions)
If I had to pick, I'd take this option. I believe this is the way GitHub works too. So in this way, each time the user saves, it searches for what has been changed in the document and somehow (which I'm not sure of the best way) it saves those specific changes only. Could be how Operational Transformation is done, by saving operations like `insert("text here", lineNumber, columnNumber)` in an array.

Later on when the user chooses to go to a specific version, it loads the original document (the first save, not the blank document), and runs all operations, in order, from version 0 to the specified version by the user (the one clicked on).

**Note:** Come to think of it, a **reverse** operational system could be better, to reduce load times. In this way, the latest version would always have the full document, and previous versions would be nothing more but an array of reverse operations. 

**Example:** If the user added the word "Hello" to the top of the document and saved it, the latest version would contain the full document included the "Hello", and the previous version would contain an array with the operation to remove the word added, such as `del("Hello", 0, 0)`.

## Question 3.1
Choosing the second option, either normal or the reverse system I've mentioned, would make developing this functionality a breeze, simply by using the operations saved in the versionning arrays. 

Using the image provided and its text settings, it would be necessary to run the operations from the version to compare with (and if the current and chosen version have different versions in between, run those too), except they would have to be ran in "Insert" mode rather than their original operation (Delete, Insert, etc), since the goal is to display **all the text** and its changes. And then add css to those operation's results. Like to all a `line-through` text decoration to all "Delete" operations, `underline` to "Insert"s, and so on.

## Question 4
### Brief explanation
**Short paragraph before getting into it:** I was a bit confused by this exercise. Well not exactly confused, but the thing is that one of NodeJS's strengths is its speed at handling many requests asynchronously, so when you asked to create a Queue what I understood was that you wanted NodeJS to be, well, synchronous and only be able to take one request at any given time. If this was the intended then great because it's what I've done, if not, let me know and I'll re-do.

### Setup
1. On the terminal, move to the folder where `server.js` is
2. Run `npm install` and `node server`/`nodemon server`
3. Open an editor who emulates a server on `html` files, like Atom or WebStorm
4. Inside the editor, move to `public`, right-click `index.html` and `Run 'index.html`

### Guidelines
Considering the above, I decided that for every PDF conversion I'd let 10x HTML requests have priority over it. Example:
* Queue has existing requests (otherwise `PDF#1` in the next line would just start running, as technically queue is empty when it arrives)
* `PDF#1 and #2` arrive at queue
* `HTML#1 to 10` arrive at queue
* Server converts `HTML#1 to 10` as `PDF#1` gave them priority
* `HTML#11 and #12` arrive at queue before `HTML#10` finished processing
* Server converts `PDF#1` because it already gave priority to 10x HTML conversions 
* Server converts `HTML#11 and #12` because `PDF#2` didn't give priority to no one yet
* Server converts `PDF#2`

***As far as the front-end goes***, as soon as request is sent to the API endpoint, the new conversion is added to the list in the table with its status set to "In Queue". From then on the front-end is just waiting for events through a web socket to change the conversion items statuses.

***In the back-end***, a queue array exists to where the next conversion will push an item and trigger an emitter event, unless the queue is bigger than 1, in which case there's an event chain already running. This emitter event will take care of validating if the current item should give priority or not, and if it doesn't, it will send a message through the socket alerting that it's now processing it. Once the timeout ends, sends another socket message to let the front-end know it's processed, and removes the item from the queue. If the queue isn't empty, it will call the event emitter event again and go through the chain until there's no more items in the queue.

**Note:** I'm sure some library exists that does exactly what I had to build by hand with the event emitter. I even went into a minor issue by doing it this way (couldn't remove event handlers until all the queue was empty). I'm almost sure `async` does this somehow, but after a while of reading its documentation for `Control Flow` I couldn't really find anything that suited the needs. I was wasting too much time and I knew I could do it with the event emitter, so I just went with it, hope that's OK (Also shows I can build my own controller of incoming requests, rite?).

## Question 4.1
The real time implementation was done through web sockets, but everything about it was explained in the previous question. The server is constantly sending data through the web sockets to all listeners which then take care of notifying the user with iGrowl (a nice tidy plugin to make my life easier).
