Procid
======

Procid is an interactive system supporting consensus building in open source issue management systems.

License
=======

This software is licensed under [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0.html).

Instructions for Evaluation
===========================
If you are here to help evaluate Procid, please follow these instructions: [How can I help evaluate Procid?](https://github.com/albaloo/procid-client/blob/master/EvaluatingProcid.md)

Instructions to Run
===================

1. Install Google chrome if you don't have it already
1. Download [procid.user.js](https://github.com/albaloo/procid-client/raw/master/procid.user.js)
1. Go to chrome extensions page by typing chrome://chrome/extensions/ in the address-bar
1. Drag procid.user.js file and drop it in the extensions page
1. Click on 'Add' and you'll see Procid added to the list of your extensions
1. Go to a drupal issue: http://drupal.org/node/331893
1. Procid panel will be added to the normal Drupal page

Instructions to Build and Contribute
====================================

1. Clone the git repository
1. Copy and paste procid.user.js and style.css from the main directoty to test
1. Import the project files from the test directoty to Eclipse
1. Run example.html
1. If you don't have internet access you can change `ABSOLUTEPATH` and `CSSSERVERPATH` variable in [procid.user.js](https://github.com/albaloo/procid-client/raw/master/procid.user.js) to "./" and run locally.
