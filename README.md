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
4. Navigation
5. Misc

Lets look at each in turn.

## Targets

### 360 Model targets
aka Trained Model targets, this is a new class of model target which can be trained (using Vuforia Engine services) to be able to recognise and
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

Note : The 3d occluding model is (currently) not included in the runtime display. 

### Area targets

Area targets provide a means of locating and tracking the user in a larger spatial environment, say a room or a small factory space. 
Instead of tracking against an object/shape or an image, you are tracking against the environment/surroundings.

Generation of the target is not included in this extension. Instead, the user should use their Vuforia Engine account to download the new Area Target Generator application, and view the documentation on the Engine website in order
to familiarise themselves with the User Interface and functionality of this tool.

In principal, the steps are as follows

1. scan your environment using a recommended camera.  There is a direct integration to Matterport included in the Area Target generator, and these cameras are perfect for small-medium sized locations.
2. upload your scan to the Matterport account. 
3. Follow the instructions in the Area Target web documentation to identify the results of the scan and to pass this information to the Target Generator
4. The Area Target generator will create the .dat and .xml target descriptor files
5. The area target generates a 3d polygonal representation of your space, named _authoring, and a lightweight _navmesh representation which can be used for occlusion. 
6. Copy the .dat and .xml, _authoring and _navmesh (the latter two are glb files) to your project resources folder
7. Drag the Area Target widget into your Studio canvas
8. Select the .dat file as the target data base for the widget. The 3d representation (same name - see step 5 above) will now appear in Studio
9. You can now place any augmented content in this space 
10. Run the experience and you should locate and track relative to the target. Your augmentations will appear where you placed them in the editor. 
11. If you check the 'occlusion' checkbox, the occlusion (_navmesh) glb file will be included in the project, and will be used at runtime to provide an
occlusion effect that will ensure any digital augmentation will appear correctly occluded by the physical space e.g. an item behind a solid cannot be seen.

Note this will soon be depricated as Studio has now integrated the Area Target widget into the product.

### Cloud Image Targets
TBC

### Custom Vumarks
TBC

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
The navigation widget provies a simple means to helping guide/navigate the user to a location within the tracked space.  To use this feature, first add
the navigation widget to your 3d scene.  You can choose how you want to help indicate the target location e.g. if you user is holding an ipad, you can choose the ipad 
representation from the dropdown. There are other options available.

The location itself can be set via data that is bound to the widget; you can link an array of locations and drive which is the current 'selected' location.  
This data can be in table form - perhaps the result of a thingworx service call - or you can set the value from javascript.

  `$scope.view.wdg.navigator.poidata = [ 
                                         { position: "0,0,0",    // defined as a string of xyz coordinates 
                                               gaze: "0,0,1",    // defined as a string, this is a unit vector pointing away from the view
                                                 up: "0, 1, 0",  // defined as a string, this is a unit vector pointing up through the device
                                           metadata: "optional"  // optional data that can be used to describe what this row indicates
                                         }
                                       ];` 

With and array, the 'Selected' field will define which row is active.
The 'value' field (output) reflects the current active target i.e. the selected row of the table.

With a value set, the navigation wiget will monitor the user location and will draw a 'ribbon' from the user device to the end location - this ribbon helps guide the
user which way to walk/navigate to reach the target location. As the user approaches the target, the ribbon will fade.

The navgation widget includes settings that will control the widget reacts as the uer approaches the chosen point - cutoff distance defines a radius around the point, and when
the user crosses this radius, the 'arrived' event is fired. You can use this to trigger some behaviour.  Note that the event is only fired as the user enters from outside of the 
radial zone.  Stepping back across the threshold does not trigger the event again.  If auto-cutoff is checked, following the 'arrived' event, the widget will hide the end marker 
items and will wait for a new location to be defined.  Use the metadata to help indicate what the position data means, such then when you 'arrive' at a location, you can immediately 
identify what that location e.g. e.g. the metadata could be a value that points you whatever task you should perform when you arrive at the location. 

The navigator widget also works on the hololens, though the operation is slightly different in that on a mobile/tablet device, the path is dynamic (it will change as the user moves) whereas on the hololens, the path is static - it is computed once (either when the navigation point 
is set, or whenever the path is shown (the Show() method).  This is for performance reasons.


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
