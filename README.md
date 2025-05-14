# hanzimode

###### this project if _functional_ and you can find it deployed on [github pages](https://asasinmode.github.io/hanzimode/). While I have more ideas for it, at the moment I'm busy using it :p

This is a small website to help with learning chinese hànzì. The aim is to create a collection of characters, then go through them, either hànzì, pinyin or meaning, and input the other 2.

To use, [visit the deployed website](https://asasinmode.github.io/hanzimode/) or manually download the `index.html` and `index.js` files, then open the `index.html` file in your browser (make sure both files are located in the same directory).

## setup

At the bottom of the page use the **expand data** button to show the list of your saved hànzì. Use the inputs to add the hànzì, its pinyin and meaning and optionally a note, then click the **add** button. The list can also be used to edit/remove existing characters.

> [!WARNING]
> Your data is automatically saved locally in browser storage, but it may be cleared by the browser/other programs. I recommend using the **export data** button to backup your collection or share it between devices with **import data**.
> **renaming or moving the `index.html` file will wipe\* browser data**

> [!TIP]
> In the **meaning** input you can add multiple words separated by a semicolon like `three; trzy; 3`. Any of these will be accepted when you play later.

_\* technically it would still be there but inaccessible to the renamed/moved `index.html` file. To get it back you'd have to rename the file back_

## settings

### a lot of the stuff described below isn't implemented, I kept it as a todo

Once you've made a collection of hànzì you're familiar with, use the toggles at the top of the screen to set your preferences.

- **guess from** - Choose what form you want the hànzì to appear in. For example checking hànzì, pinyin and meaning will mean the _next_ character will appear in any of those 3 forms. Checking just pinyin would make all characters appear as pinyin (and you'd be guessing meaning and hànzì).
- **blur** - Toggle whether to blur the input when unhovered/unfocused.
- ~~**input** - Choose what input is expected. For example, with only pinyin checked in _mode_, the expected input can be any or both of hànzì/meaning. Note that _mode_ requires a specific configuration for _input_. It wouldn't make sense to have both the _mode_ and _input_ be pinyin.~~
- ~~**diacritic helper** - toggle which shows/hides the special characters like `ê ù í à` when you type the pinyin. The exact spelling is required for the _input_ to be correct but if you have a way of entering those characters on your own feel free to hide the helper.~~

## play

Use the **start loop** button to start going through the characters you've added. A black square **you can draw in** will appear and below it the character in one of your selected _modes_. At the bottom there will be inputs for other variants. Once you fill them, use the **check** button to see if you're correct. If you're struggling, you can **reveal** any of the expected inputs or your note by hovering over it.

In the top left there is a counter showing how many characters you've gone through out of all of the ones you've added. Use the **reset loop** button at any point (or when finished) to clear your progress and begin a new loop.

### future features?

0. advanced settings?
1. choose which type to show: hanzi/pinyin/meaning.
   - toggle mode how many choose options (3/5?) or type any of meaning/pinyin/hanzi
   - pinyin diacritic helpers, 'ą'.normalize('NFD')
   - notifications (save/loaded) & errors somewhere
2. merge collections
3. fast mode? skip the `next` button, if correct move on after check
4. select from collection which ones to use/add "subcollections" that use stuff from main?
5. store loop info/settings
