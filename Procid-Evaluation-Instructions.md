What is Procid?
===============
Procid is a user script for drupal.org. It offers multiple interactive features to make the Drupal issue queue a more effective medium for resolving issues. 

How can I help?
==================================
Try Procid on Drupal discussions for two weeks and let us know what you think. We would like to understand the effectiveness of our tool and gather Drupal community members' comments to improve the next version.

How do I install Procid?
========================
Procid is a user script which will be installed in your browser, not in Drupal.

Please download the [procid.user.js](https://github.com/albaloo/procid-client/raw/master/procid.user.js) file (you may need to right click and then "Save link as..." to get the file). 

- In Chrome, go to chrome://extensions/, and drag the newly downloaded file to the extensions page to install it ([visual instructions](https://raw.github.com/albaloo/procid-client/master/screenshots/procid-chrome-installation.jpg)).
- In Opera, follow these [instructions](http://my.opera.com/Contrid/blog/2007/02/11/how-to-greasemonkey-in-opera).
- In Firefox, update to the lastst version of FireFox, install the [GreaseMonkey extension](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/), and follow these [instructions](http://userscripts.org/about/installing). 
- In Safari, install the NinjaKit extension, and follow these [instructions](http://wiki.greasespot.net/Cross-browser_userscripting#cite_note-2).

**You must be logged-in your Drupal account to see Procid's features.**

To verify that procid was installed successfully, click on this link: http://drupal.org/node/331893. After a few moments, you should be able to see procid's header added to the discussion ([view screenshot](https://raw.github.com/albaloo/procid-client/master/screenshots/survey-install-check.png)).

How do I provide Feedback?
==================
You can provide feedback on Procid using one of the following methods:

1. Creating a new [issue on github](https://github.com/albaloo/procid-client/issues).
1. Sending an email to <a href="mailto:rzilouc2@illinois.edu">Roshanak Zilouchian</a>.
1. Commenting on a [discussion about Procid](https://groups.drupal.org/node/327438) on Drupal.org.

How do I use Procid?
===================
Please see below for a quick overview of Procid's features.
You can also [watch a demo on YouTube](https://www.youtube.com/watch?v=a_kHWOjXEtQ).

##Procid's Main Page
Procid's Main Page adds a navigation panel on the left side of the discussion. The navigation panel provides five different lenses to explore different types of comments. The lenses will highlight must read comments, comments containing ideas, comments containing conversations, comments provided by experienced members, and comments that include patches.

### What can I do in the Main Page? 
1. If you are not in Procid's Main Page, click on the Main Page icon.
1. Click on one of the lenses on the navigation panel.
1. Scroll down to see the highlighted comments, if you find a comment that you want to read, simply click on the link.

![Figure 1](https://raw.github.com/albaloo/procid-client/master/screenshots/survey-homepage-idea.png)

##Procid's Idea Page
The Idea Page summarizes all the ideas proposed by participants, shows the status of each idea, and organizes the comments related to each idea to supportive, neutral, and constructive comments.

###What can I do in the Idea Page? 
1. Click on the Idea Page icon. 
1. Scroll down the page to see all the ideas.
1. Check the status of each idea. The set of possible statuses for each idea are "Ongoing", "Implemented", and "Dropped". The default status is "Ongoing", but if you feel a particular idea has a lot of arguments against it, you can change the status to "Dropped". Or if an idea has a patch, you can change the status to "Implemented". 
1. Check the comments that are related to each idea. You can add a new supportive, neutral, or constructive comment by clicking on the "+" button on the right hand side of the comments. 

![Figure 2](https://raw.github.com/albaloo/procid-client/master/screenshots/survey-ideapage.png)

##Criteria Column
Under the criteria column in the Idea Page you can establish criteria for evaluating ideas. For example, if you want the final solution to have low implementation cost, you can add that as a criteria for evaluating ideas.

###What can I do with the criteria column?
1. If you are not in the Idea Page, click on the Idea Page icon. 
1. If there are not any criteria listed under the "Criteria" section, add a new criteria for evaluation.
1. You can rate the ideas based on the criteria and leave a comment explaining the reason behind your rating.

![Figure 3](https://raw.github.com/albaloo/procid-client/master/screenshots/survey-ideapage-criteria.png)
 
##Procid's Invite Page
The Invite Page shows a list of Drupal members that may be good candidates to invite to the discussion. Our system extracts this list from Drupal community members based on their experience, the number of patches they submitted, their recent participation, and the number of discussions that they have participated and reached consensus (i.e. the discussion was closed). 

###What can I do in the Invite Page?
1. Click on the Invite Page icon. 
1. Click on one of the lenses to highlight participants.
1. Scroll through the list of highlighted participants.

![Figure 4](https://raw.github.com/albaloo/procid-client/master/screenshots/survey-invitepage.png)
