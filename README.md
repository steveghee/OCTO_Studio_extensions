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
aka Trained Model targets, this is a new class of model target wihch can be trained (using Vuforia Engine services) to be able to recognise and
snap to a model target from any angle.  This if course differs to the standard model target where there is a specific perspective (otten indicated via a helpful 'guide view'). With Trained / 360 models targets, 
recognition can be 'trained' to occur from a broad range of angles, all the way up to 360 around the target item.

Training of the target is not included in this extension. Instead, the user shoudl use their Vuforia Engine account to download the new Model Target Generator application, and view the documentation on the Engine website in order
to familiarise themselves with the User Interface and functionality of this tool.  

In principal, inclusion of a trained model target into Vuforia Studio is simple.

1. create trained model target using Vuforia Engine target generator application. This will generate two files, <filename>.dat and <filename.xml> based on whatever name you gave in the target generator app.
2. copy these two files into the app/resources/Uploaded folder in Studio. You can use the 'add resource' button
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
TBC

### Cloud Image Targets
TBC

### Custom Vumarks
TBC

## Inputs
TBC

## Containers
TBC

## Navigation

## Misc
TBC
