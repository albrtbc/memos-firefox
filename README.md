## About

A Firefox extension for Memos, ported from the corresponding [Chrome extension](https://chrome.google.com/webstore/detail/memos-bber/cbhjebjfccgchgbmfbobjmebjjckgofe/). Original author: [lmm214](https://immmmm.com)

> Chrome extension description: A browser extension for publishing to [Memos](https://usememos.com/). Based on iSpeak-bber, original author: [DreamyTZK](https://www.antmoe.com/).

## Changelog

2024.07.30 Ported to Firefox

2024.07.21 Breaking update, now compatible with v0.22.3

2024.06.15 Thanks to a contributor for [PR#44](https://github.com/lmm214/memos-bber/pull/44)

2024.05.20 Updated to match v0.22

2023.09.19 Breaking update to match Memos v0.15 `Access tokens` mode.

<img width="483" alt="123" src="https://github.com/lmm214/memos-bber/assets/1472390/4ce2edc2-ce64-44d5-b4ef-d2e79b9d6a1a">

2023.07.16 Added support for Memos v0.14.0 `api/v1`, while maintaining backward compatibility with previous API.

2023.04.29 Various improvements to the context menu, thanks to @EZForever's PR [#17](https://github.com/lmm214/memos-bber/pull/17)

2023.04.09 Updated to match v0.12.0: attachment links changed from filename to publicId.

2023.03.25 Context menu text sending changed to "append mode" (does not refresh already-opened pages); added multi-language support (en, zh-cn).

2023.03.19 Image upload renamed with precise seconds; focus input box when opening the extension (combined with context menu text sending, keyboard shortcut to open extension, and Ctrl+Enter to save).

2023.03.10 Fixed fetching the latest Memo after publishing.

2023.03.09 Added right-click "send text to Memos" input box.

![iShot_2023-03-05](https://user-images.githubusercontent.com/1472390/222957393-fc2e933e-b18f-4e69-a8c0-4609f84a0a90.png)

2023.03.05 Added tag-based visibility control ("private" or "public"); added timestamp to uploaded image filenames.

2023.02.26 Changed Memos visibility button style. Added Ctrl/Meta + Enter to save. Click title to navigate to main site.

2023.02.25 Fixed random button not working on v0.11.0. (API `amount` parameter deprecated, switched to `stats` to get total count)

![iShot_2023-02-06_19 16 28](https://user-images.githubusercontent.com/1472390/216958098-1f4fab2a-e77c-41bd-8ba3-5786f42744d7.png)

2023.02.07 Added display of the latest Memo after publishing; added archive button for individual memos.

2023.02.06 Added search button; added image lightbox.

![iShot_2023-02-04_20 42 40](https://user-images.githubusercontent.com/1472390/216768533-4a93124a-666e-4617-a60b-29c826dc1584.png)

2023.02.05 Random Memos now supports filtering by tag (easter egg: open the tag list, have exactly 1 tag in the input box, then click the random button).

2023.02.04 Added random Memos button to revisit past memories.

2022.11.15 Added file/image insert button; attempted to fix first-install requiring a click on the lock icon.

2022.11.13 Added insert todo button.

2022.11.8 Added drag-and-drop attachment upload (one at a time).

2022.10.24 Added visibility setting for posts.
