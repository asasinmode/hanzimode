# hanzimode

This is a small website to help with learning chinese hànzì. The aim is to create a collection of characters, then go through them, either hànzì, pinyin or meaning, and input the other 2.

To use, download the `index.html` and `index.js` files, then open the `index.html` file in your browser (make sure both files are located in the same directory).

## setup

At the bottom of the page use the **expand data** button to show the list of your saved hànzì. Use the inputs to add the hànzì, its pinyin and meaning and optionally a note, then click the **add** button. The list can also be used to edit/remove existing characters.

> [!WARNING]
> Your data is automatically saved locally in browser storage, but it may be cleared because of external factors. I recommend using the **export data** button to backup your hànzì or share it between devices with **import data**.

> [!TIP]
> In the **meaning** input you can add multiple words separated by a semicolon like `age;years`. Any of these will be accepted when you play later.

## settings

Once you've made a collection of hànzì you're familiar with, use the toggles at the top of the screen to set your preferences.

- **mode** - Choose what form you want the hànzì to appear in. for example checking hànzì, pinyin and meaning will mean the _next_ character will appear in any of those 3 forms. Checking just pinyin would make all characters appear as pinyin.
- **input** - Choose what input is expected. For example, with only pinyin checked in _mode_, the expected input can be any or both of hànzì/meaning. Note that _mode_ requires a specific configuration for _input_. It wouldn't make sense to have both the _mode_ and _input_ be pinyin.
  Finally, there is the **diacritic helper** toggle which shows/hides the special characters like `ê ù í à` when you type the pinyin. The exact spelling is required for the _input_ to be correct but if you have a way of entering those characters on your own feel free to hide the helper.

## play

Use the **start loop** button to start going through the characters you've added. A character in one of your selected _modes_ will appear in the middle, then below it will be the selected inputs. Once you fill them, use the **check** button to see if you're correct. If you're struggling, you can **reveal** any of the expected inputs or your note.

In the top left there is a counter showing how many characters you've gone through out of all of the ones you've added. Use the **reset loop** button at any point (or when you finished) to clear your progress and begin a new loop.

###### todo

0. save/load data
1. adding hanzi
2. import/export functionality + validation
3. choose which type to show: hanzi/pinyin/meaning.
   - toggle mode how many choose options (3/5?) or type any of meaning/pinyin/hanzi
   - add noise hanzi?
   - pinyin diacritic helpers
   - some button/hover to reveal one of other 2
   - display note somewhere
   - notifications (save/loaded) & errors somewhere
4. start loop
5. reset loop
6. store loop info
7. store loop settings
8. display X/Y hanzi progressed through/stored

###### future?

0. advanced settings?
1. add images?
2. merge somebody else's data
3. fast mode? skip the `next` button, if correct move on after check
