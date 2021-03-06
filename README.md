Procid
======

Procid is an interactive system supporting consensus building in open source issue management systems.
You can [watch a demo on YouTube](https://www.youtube.com/watch?v=a_kHWOjXEtQ&cc_load_policy=1).

Procid is also a [sanbox project on Drupal.org](https://drupal.org/sandbox/rzilouc2/2032763) with an active [issue queue](https://drupal.org/project/issues/2032763?status=All&categories=All).

License
=======

This software is licensed under [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0.html).

Instructions for Evaluation
===========================
If you are here to help evaluate Procid, please follow these instructions: [How can I help evaluate Procid?](https://github.com/albaloo/procid-client/blob/master/EvaluatingProcid.md)

Instructions to Run
===================

1. Install Google Chrome (more recent than 31.0.1650.63) or Firefox (more recent than 25.0.1).
1. Download [procid.user.js](https://github.com/albaloo/procid-client/raw/master/procid.user.js)
1. Go to chrome extensions page by typing chrome://chrome/extensions/ in the address-bar
1. Drag procid.user.js file and drop it in the extensions page
1. Click on 'Add' and you'll see Procid added to the list of your extensions
1. Go to any drupal issue like http://drupal.org/node/331893
1. Procid panel will be added to the normal Drupal page
1. For issues not having a Procid started notice the blue button on the top right.

Instructions to Build and Contribute
====================================

1. Clone the git repository
1. Copy and paste procid.user.js and style.css from the main directoty to test
1. Import the project files from the test directoty to Eclipse
1. Run example.html
1. If you don't have internet access you can change `ABSOLUTEPATH` and `CSSSERVERPATH` variable in [procid.user.js](https://github.com/albaloo/procid-client/raw/master/procid.user.js) to "./" and run locally.
