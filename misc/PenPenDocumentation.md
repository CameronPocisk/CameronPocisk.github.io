# Describe the project
This project (PenPen) is a new take on a smart pen. This pen has all of the standard smart pen features, and then a few more. What seperates this pen from other smart pens, is its control panel, and functional back.
### The Control Panel
- First, the screen. This shows the user the following information (Left to right)
    - A preview of the brush
    - The 'control-mode'
    - Icons for the 2 selected macros
- Next, there are 6 total buttons, seperated into a top and bottom row.
    - Top left and bottom left buttons activate the selected macros
    - Top middle and bottom middle buttons change the control-mode, which lets you edit properties which can be controlled by ...
    - ... Top right and bottom right buttons increment or decrement the property of the selected control mode. 
### Smart Back
Besides the control panel, the back of the pen is also 'smart'.
- The user can move a dial to point to an icon which determines how the back will behave. It can...
    - Highlight (A translucent rectangle like pen mode)
    - Erase (Highly requested feature that lets the user erase their drawing with the back of the pen)
    - Eyedrop (Since this is on the physical pen, the eyedropper tool will make the pen take the color of whatever real world object it touches). 

# Design Work
Describe your interface in detail:
Explain the features and controls
Include plenty of screenshots to illustrate your interface and different actions users can perform within it

# Explain how you implemented this application (libraries, code structure....)
This is my first svelete project, so it took me a second to figure out how to best structure the code. I decided that I was going to try to make one singleton instance of a class (`penClass`) to represent the whole Pen. Svelte allows you to do this with 'setContext' and 'getContext'. Using these methods I allowed the sub components interact with singleton (Set data and Get data).

Even though I was following a singleton pattern, I still tried to make all of the code very modular. All of the sub-components have their individular functionality in the `<script>` section of their `.svelte` file. Also, I tried to avoid any global styling and keep all the style information in each component (Also using ratios where possible).

### Fun Components.
While developing, I was able to get creative with a few of my components / implementations. 

#### Scrolling Background
I am hoping that some of you reading this may wonder how exactly the background of this website renders? The truth is that none of the divs are actually moving. 
There is a background that scrolls, but is actually just a gif.
But not any gif!! I could only find one moving grid pattern online (I know right), and I used an editor to transform the gif into the background
**Original**
![OG grid](src\assets\gridOG.gif)
**Rotated**
![Rotated grid](src\assets\gridRotated.gif) 
**Quadrupled (twice)**
![Quadrupled grid](src\assets\GridQuadrupled.gif) 
**Colorized**
![Final grid](src\assets\GreyLargeGrid.gif) 

Okay, so what the background moves. What about the drawing? The entire canvas is on a timer. Each time it fires, the script creates a new invisible canvas element and copies the current one over there. Once that is done, the main canvas is cleared, and the copied content is drawn onto the main canvas one increment higher. It is then drawn a second time below so that the content is wrapped.
Boom - whole thing moving up and down :)

#### Macro Buttons
Even though the control panel was kind of a pain to implement, I enjoyed coming up with a few macros. All of the macros are super powerful even in the context of my webpage. If this were a real smart pen on a real drawing interface, I think the macros could be the best part of the pen. I imagine that undo and redo would be super popular but users could just take this so far. The implementation is pretty straightforward, but it was a fun way to allow the user to do a lot more. 

# Future work- No project is ever fully done. What would you do next?  This is also a place to discuss the work you attempted but could not fully complete before the project deadline- include screenshots to illustrate and document your progress. 

# AI documentation- describe how you used AI, if you used it. 

# Include a 2-3 minute demo video, showing your interface in action. 
The easiest way to record this is with a screen capture tool, which also captures audio- such as Quicktime.  Use a voiceover to explain your application.  Include the name of the project, your name, the project components, and how your application works.  You can present it on your webpage or on youtube, but it must be linked on your webpage.

# Include a link to your source code on github and a link to the publicly hosted application.  