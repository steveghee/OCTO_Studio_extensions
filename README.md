# OCTO_Studio_extensions
A list of extensions for the Vuforia Studio platform

These include
* low-level (TML) support for new Vuforia Engine features e.g. Area and Traned model targets
* 3d UI widgets for the hololens e.g. buttons, toggles, tethered backplate
* 3d assistance tools e,g 'pinger' (attract attention), navigator
* non-graphical logic elements e.g. AND/OR gates, flipflops, latches

## Installation

Download the entire folder structure and unpack into the Vuforia/Studio installation/Extensions
directory.  Stop and restart Studio. The extensions widgets will now appear in the various control pallete locations.
 
## Details

The extension can be broken down into 4 main catagories

1. Targets
2. Inputs
3. Containers
4. Navigation **new : "zone of interest" widget
5. Misc

Lets look at each in turn.

## Targets

### 360 Model targets
Note : possibly depricated soon : product now includes updated mode target, including advanced target


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

## Misc

### Logic and state management
Included are a collection of simple logic 'gates' (based on core principals and building blocks used in microelectronics).
These building blocks can be used to controlling state within you application.

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
