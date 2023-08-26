# OCTO_Studio_extensions
A list of extensions for the Vuforia Studio platform

Pleasse note : these are provided as example only. Whilst I do my utmost to keep them working, these are purely examples of 'useful' 
tools, capabiliites etc. that the user might find valuable in building an experience using Vuforia Studio.  
They are provided free of charge, and can be used, adapted, altered freely, but they are completely unsupported.

These include
* low-level (TML) support for new Vuforia Engine features e.g. Area and Trained model targets
* 3d UI widgets for the hololens e.g. buttons, toggles, tethered backplate
* 3d assistance tools e,g 'pinger' (attract attention), navigator, markup
* non-graphical logic elements e.g. AND/OR gates, flipflops, latches

## Installation

Download the entire folder structure and unpack into the Vuforia/Studio installation/Extensions
directory.  Stop and restart Studio. The extensions widgets will now appear in the various control pallete locations.
 
## Details

The extension can be broken down into 4 main catagories

1. Targets
2. Inputs
3. Containers
4. Navigation
5. Step by Step Instructions (new)
6. Misc 

Lets look at each in turn.

## Targets
### Dynamic Target (new)

Work In Progress

The dynamic target widget can be used to bind external target references e.g. targets that are created and stored in the Experience Service repository or a Thingworx file repository.
These target dat/xml and guide view sets can be referenced as url, and this widget will load them.

Suggestions for using this widget
1. prepare your external targets in suitable repositories
2. know the type of target - the url you provide will define the target type
for example, a model target is defined as "vuforia-model:///path to target/tartname?id=targetid".  You must fill in the parmaters correctly
a spatial target is simplly "spatial://"

To make your experience dynamic, you wlil pass the target information to the experience at launch - you can do this by passing application parameters in the launch url
these parameters can be formed using services such as the Identity Resolution Service (IRS) - part of the Experience Server - or you can form the url yourself e.g. using a QR code.

Bind your application parameter to the 'dataset' and 'guide' parameters of the dynamic target widget.  These paameters, when supplied at runtime, will then supply the values needed to load the target.

An mention abve, this widget is still work in progress, so there's a few issues to be ironed out still.  Basic testing shows that spatial, image and model targets all work.



### 360 Model targets

aka Trained or Adnvanced Model targets, this is a new class of model target which can be trained (using Vuforia Engine services) to be able to recognise and
snap to a model target from any angle.  This if course differs to the standard model target where there is a specific perspective (otten indicated via a helpful 'guide view'). With Trained / 360 models targets, 
recognition can be 'trained' to occur from a broad range of angles, all the way up to 360 around the target item.

Training of the target is not included in this extension. Instead, the user should use their Vuforia Engine account to download the new Model Target Generator application, and view the documentation on the Engine website in order
to familiarise themselves with the User Interface and functionality of this tool.  

In principal, inclusion of a trained model target into Vuforia Studio is simple.

1. create trained model target using Vuforia Engine target generator application. This will generate two files, <filename>.dat and <filename.xml> based on whatever name you gave in the target generator app.
2. copy these two files (.dat and .xml) into the app/resources/Uploaded folder in Studio. You can use the 'add resource' button, but be sure to add the two files
  * note that clicking 'add resource' from the widget 'target' field will only select and copy the selected (dat) file, so will not copy the xml file.  This is a know problem, Instead, bring both files over to the resources folder first
  * if you have created a suitable guide view to help your user identify the product, you can also copy that png file over to the experience
3. If your target was created from a pvz file, also copy that file into the resources/Uploaded folder.  It should be given the same <filename> as the target e.g. <filename>.pvz
4. add the 360 target widget into you experience.  
5. The widget includes property settings for the Data Set - here you can select the <filename>.dat that you copied in step 2.
  * you can also include a guide view
6. selecting this data set will automatically include (for visual reference) the 3d model that you included in step 4.
7. you can now position any augmentations relative to your target, using the 3d pvz model as a reference.  

Note the 3d pvz model is displayed as 'occluding' as this should help the author orient the content
around the target, and understand what the user will/not see when viewing from 
various perspectives.  

Note also : The 3d occluding model is (currently) not included in the runtime display. 

Finally, the widget is in fact a generic target that will support any model target, so you can use standard and advanced/360 targets with this widget.  You don't have to use advanced/360 targets.

### Area targets
Note : depricated : product now includes this target type

### Cloud Image Targets
depricated: product now includes this target type

### Custom Vumarks
depricated: product now includes this target type

## Inputs
UI elements such as Hololens2-ready UI controls.
Note that many of these will be obsoleted soon, as they've been migrated into the Studio product build.  

### Busy Indicator
When enabled, this will display a simple "traditional" spinning wheel indicating that something is happening...

### Progress Indicator
Takes a value 0..100 which indicates percentage-complete status. This widget will draw the the image provided as the resource, and it will
stretch this image across the width of the control based on the percentage complete value.

if the stepped box is checked, you can enter the number of steps into which the
widget will quantize the value for example steps=5 will divide the control into 5 even blocks.  Then the value hits 20%, the first block will be filled with the supplied image. Same for the other settings e.g. 40,60,80,100%

### List
WIP

## Metadata 
### Finder
Provides real-time metadata shearch within specified model ID.
ou can supply the property name, the search value, and the operation to use e.g. "cost" "greater than" "20".  The property name, values, and the operand can be data driven via binding.
 
Results can be bound to Mapper (see below) for visualisation.

Hint : Use the metagetta to quickly identify what metadata is on your model. This can help you determine which values are useful in your search operation.

### Mapper
Takes an input of selected model item ids and applied highlight shading

Set the model id to be that of the main model that you are working on (same value as supplied for the Finder/Metagetta widgets).
Bind the output of the finder to the mapper, and as results are discovered (in Finder) so the mapper will highlight them for you. 
The Mapper works in two modes, physical (where there is a physical product present, so the mapper will show the highlight as an overlay, only lighting up the ites found) 
and in digitial mode, where the mapper will show the digital model rendered one way, and will emphasise the results items.

### MetaGetta
Takes an input of selected model item ids and extracts metadata. 

In the simplest mode, drag/drop the widget into the scene and bind the result output to a label.  In preview (or runtime experience) if you tap in a 3d element (part) the metagetta widget will list 
all the properties/value associated with the selected item.

Next, using "fields to include", you can set a list (comma separated, no spaces) of properties that are to be included in the output. Use this to filter down to the properties you need.

## Containers
TBC

## Navigation
There are two widgets in this category

###Navigator
Note : depricated : product now includes this capability in the form of the wayfinder


###Zones of Interest (**new**)
The Zones of interest widget provies a mechanism to declare one or more zones (these are cylindrical is shape) and position these in 
your space.  When then user navigates the scene and crossed into or exist a zone, the widget will output appropriate events that allows your experince to react to the user proximity.

Similar to the navigator widget, you can declare/bind an array zones and the control will manage them for you.  You can also create/mark new zones on demand.
This data can be in table form - perhaps the result of a thingworx service call - or you can set the value from javascript.

  `$scope.view.wdg.zones.zoidata = [ 
                                         { position: "0,0,0",    // defined as a string of xyz coordinates 
                                              color: [1,0,0],    // optional information to define/override color of POI indicator 
                                             cutoff: 2           // optional; defines the radius of this specific zone
                                         }
                                       ];` 

This section TO BE COMPLETED

## Step by Step Instructions (aka SXSL)

(Important note : this is an early alpha version of this widget : testing has been limited so far to landscape ipad devices, so any other device/display format may look wrong - it will get fixed over time. Right now the focus is functionality)

sxsl is a language (implemented as a json data format) for defining step-by-step instructions.  
Sxsl content can be output from Creo Illustrate, or created in tools such as Expert Capture. The format is designed to be very simple, allowing sxsl content to be
generated using simple tools such as Python or node.js, taking content (assets, resources etc.) from any instruction source.

The sxsl widget provides a convenient player, including built-in UI, which will execute this sxsl language and will deliver AR-enabled instructions.

The src property should be set to point to a valid sxsl defintion/file (json format).  If bound to a URL, the widget will fetch the content.  It is assumed that the associated 2d/3d resources, including any 
associated tracking targets, are included in the same relative location as the the sxsl json.  This file could be local (in the experience) or could be situated on a remote data service e.g. the Experience Service, Thingworx or elsewhere.  Src is a URL that points to this resource. You can also bind this property to an inline serialised (JSON serialised string) representation of the sxsl structure - if detected the widget will interpret the sxsl directly (it does not need to load a file). An optional (hidden) 'Content Location' field is provided for cases wher eyou might have sxsl content which includes relative file references; the content location property can be a string which describes the base file path/url to the data, in the form "server:path/to/data/".  Note the / on the end is important. 

The sxsl2 specification can be found here (TODO: link to be provided)

The widget will display the instruction control UI, including any 2d (image, video) references.  

Step List property holds areference to the list of valid steps that can be visited. You can bind this to a list, and clck on an item to jump to that step.
Tools Required property holds a reference to a list of any tools that are required to execute this procedure. The tool name, info and (optional) image are included. This is for reference purposes only i.e. this list is non=interactive.

### properties
The steplist property provides an infotable which lists all the available steps - you can display this in a list/repeater to view and select/jump to specific steps. Only valid next steps are presented.

Stepclock provides an (optional) timecheck on the progress of each instruction step; sxsl allows for a 'target' time to be defined, and this value, along with the running clock (in milliseconds) is provided.  You can choose if and how you want to present this information.

(TBC)

### Events and services
Events are fired to allow users to integrate this widget into other processes.

The player will communicate with Thingworx if the appropriate Thing interfaces are present - loaded as 'external data' Things within Studio.
TBC


## Misc

### Image markup (** new **)
The markup widget can be used to provide in-situ markup (pen,text, shapes) over an 
image e.g. a photo collected from the camera widget.  Connect the image_url output from the camera to the image_url input of the markup; connect the picture taken even from the camera to the start markup service of the markup widget. When you take a picture, the markup editor
will open and you can draw on the image. Click ok to generate a new image - you can route this to thingworx or similar.

### Logic and state management
Included are a collection of simple logic 'gates' (based on core principals and building blocks used in microelectronics).
These building blocks can be used to controlling state within you application.

#### ABSwitch
A simple A/B switch, where 'output' is a binary choice between input 'A' and input B'.
The 'polarity' field drives the selection; if polarity is true, input A is chosen. Inputs and output are strings.

#### Amp
A simple amplifier widget that takes two numerical input signals, 'input' and 'gain', and emits an 'output' which is the
product of the two values e.g. `output = input * gain`

#### Flip Flop
The flipflop emulates a standard JK flipflop electronic circuit.  It can be set to a value (true) or reset (false) or it can set to 'toggle' mode and 'clocked' to bounce between these two states.
The output Q reflects the behaviour above.  Qbar is the opposite of Q i.e. if Q is true, Qbar is false.

When in Auto mode (Auto=true), Set or Reset will be immediately reflected in Q/Qbar.
With Auto-false, the widget must be 'clocked' (Clk) to propogate the value.
In Toggle mode (Toggle=true), state will change when the widget is clocked.  

This useful utitlity widget can be used, for example, to turn an event say a button press, or the response from a Thingworx service call) into a usable state value (true/false) that can then be used to control other elements of the experience.

#### Gate
The Gate takes an input (Property) and a Value to test against, and a defined operation (Op). The output reflects the result of the operation
e.g. is the op is 'greater than' then the output will follow the input if the input (Property)  is greater than the defined Value.

Gate can be used for basic threshhold and comparison tests e.g. you can compare strings (A like B), you can compare dates (A before B) and you can perform numeric
comparisons e.g. A > B.   Chaining Gates together allows for more complex expressions e.g.   3 < A < 12

#### Increment
A simple counter which takes two inputs - the starting value and the increment (default is 1) and when 'clocked' the value will 
increase by the defined quotient.  

Reset will set the value back to the initial value.

#### Latch
The latch captures and retains whatever boolean value (true /false) was applied to the input when clocked.
Q and Qbar outputs are provided.

#### Logic
The logic block takes two inputs A,B and an Boolean operand.  The can be one of 
AND,OR,NAND,NOR,XOR.  The output is the result of the boolean operation of the two values.

This block can be used to check combinatorial state i.e. only when I press the two buttons on should the panel open (button A AND buton B).

#### Oscillator
The oscillator is a simple selectable-wave generator which will drive its output between the two min/max limits defined.  
Rate defines the number of cycles / second. The oscillator can be given a start value. 
You can choose between sine, saw, triangle and square waveforms.

Reset will restart the oscillator at the starting value.

#### Register
The register is similar to the latch, but works with non-boolean data.
It can be used to store strings, numbers etc.
