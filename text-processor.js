// Emoji to ASCII emoticon/symbol mappings
const EMOJI_MAP = {
  '❤️': '<3',
  '💙': '<3',
  '💚': '<3',
  '💛': '<3',
  '💜': '<3',
  '🖤': '<3',
  '🤍': '<3',
  '😀': ':)',
  '😃': ':D',
  '😄': ':D',
  '😁': ':D',
  '😊': ':)',
  '😇': 'O:)',
  '🙂': ':)',
  '🙃': '(-:',
  '😉': ';)',
  '😌': ':)',
  '😍': '<3',
  '🥰': '<3',
  '😘': ':*',
  '😗': ':*',
  '😙': ':*',
  '😚': ':*',
  '😋': ':P',
  '😛': ':P',
  '😝': 'XP',
  '😜': ';P',
  '🤪': 'XP',
  '🤨': ':\\',
  '🧐': 'o_O',
  '🤓': '8-)',
  '😎': 'B-)',
  '🥳': ':D',
  '😏': ':]',
  '😒': '-_-',
  '😞': ':(',
  '😔': ':(',
  '😟': ':(',
  '😕': ':/',
  '🙁': ':(',
  '☹️': ':(',
  '😣': '>_<',
  '😖': '>_<',
  '😫': 'D:',
  '😩': 'D:',
  '🥺': ':(',
  '😢': ':\'(',
  '😭': 'T_T',
  '😤': '>:(',
  '😠': '>:(',
  '😡': '>:(',
  '🤬': '#$%!',
  '😱': 'D:',
  '😨': 'D:',
  '😰': 'D:',
  '😥': ':\'(',
  '😓': '^^;',
  '🤗': ':)',
  '🤔': '?_?',
  '🤭': ':x',
  '🤫': ':x',
  '🤥': ':L',
  '😶': ':|',
  '😐': ':|',
  '😑': '-_-',
  '😬': ':S',
  '🙄': '-_-',
  '😯': ':o',
  '😦': 'D:',
  '😧': 'D:',
  '😮': ':O',
  '😲': ':O',
  '🥱': '-_-',
  '😴': 'zzZ',
  '🤤': ':p~',
  '😪': ':\'(',
  '😵': '@_@',
  '🤐': ':X',
  '🥴': '@_@',
  '🤢': 'X_X',
  '🤮': 'X_X',
  '🤧': '>_<',
  '😷': ':-#',
  '🤒': ':-#',
  '🤕': ':-#',
  '👍': '+1',
  '👎': '-1',
  '👌': 'OK',
  '✌️': 'V',
  '🤞': 'X',
  '🤟': 'ILY',
  '🤘': '\\m/',
  '👏': '*clap*',
  '🙌': '\\o/',
  '👐': ':D',
  '🤲': ':)',
  '🤝': '*shake*',
  '🙏': '*pray*',
  '✍️': '*write*',
  '💪': '*flex*',
  '🦾': '*flex*',
  '🎉': '*party*',
  '🎊': '*party*',
  '🎈': 'o',
  '🎁': '[gift]',
  '🏆': '[trophy]',
  '🥇': '#1',
  '🥈': '#2',
  '🥉': '#3',
  '⭐': '*',
  '🌟': '*',
  '✨': '*~*',
  '💫': '*',
  '🔥': '(fire)',
  '💥': '*BOOM*',
  '💢': '!',
  '💯': '100',
  '✅': '[x]',
  '☑️': '[x]',
  '✔️': '[x]',
  '❌': '[X]',
  '❎': '[X]',
  '⚠️': '/!\\',
  '🚫': '[NO]',
  '💤': 'zzZ',
  '💭': '...',
  '💬': '...',
  '🗨️': '...',
  '🗯️': '!',
  '💡': '(i)',
  '🔔': '*ding*',
  '📢': '>>',
  '📣': '>>',
  '🎵': '~',
  '🎶': '~~',
  '🎤': '[mic]',
  '📱': '[phone]',
  '📧': '@',
  '💌': '@',
  '📨': '@',
  '📩': '@',
  '📮': '@',
  '📪': '@',
  '📬': '@',
  '📭': '@',
  '📫': '@',
  '🖨️': '[printer]',
  '⌨️': '[keyboard]',
  '🖱️': '[mouse]',
  '🖥️': '[pc]',
  '💻': '[laptop]',
  '☕': '[coffee]',
  '🍕': '[pizza]',
  '🍔': '[burger]',
  '🍟': '[fries]',
  '🍿': '[popcorn]',
  '🍩': '[donut]',
  '🍪': '[cookie]',
  '🍰': '[cake]',
  '🎂': '[cake]',
  '🍺': '[beer]',
  '🍻': '[cheers]',
  '🍷': '[wine]',
  '🥂': '[cheers]',
  '🌮': '[taco]',
  '🌯': '[burrito]',
  '🥗': '[salad]',
  '🍎': '[apple]',
  '🍊': '[orange]',
  '🍋': '[lemon]',
  '🍌': '[banana]',
  '🍉': '[melon]',
  '🍇': '[grapes]',
  '🍓': '[berry]',
  '🥝': '[kiwi]',
  '🍑': '[peach]',
  '🥥': '[coconut]',
  '🥑': '[avocado]',
  '🍆': '[eggplant]',
  '🥕': '[carrot]',
  '🌽': '[corn]',
  '🥒': '[pickle]',
  '🥦': '[broccoli]',
  '🧄': '[garlic]',
  '🧅': '[onion]',
  '🍄': '[mushroom]',
  '🥜': '[peanut]',
  '🌰': '[nut]',
  '🍞': '[bread]',
  '🥐': '[croissant]',
  '🥖': '[baguette]',
  '🥨': '[pretzel]',
  '🥯': '[bagel]',
  '🧀': '[cheese]',
  '🥚': '[egg]',
  '🍳': '[cooking]',
  '🥓': '[bacon]',
  '🥩': '[steak]',
  '🍗': '[chicken]',
  '🍖': '[meat]',
  '🦴': '[bone]',
  '🌭': '[hotdog]',
  '🍱': '[bento]',
  '🍜': '[ramen]',
  '🍝': '[pasta]',
  '🍛': '[curry]',
  '🍲': '[stew]',
  '🥘': '[pan]',
  '🍣': '[sushi]',
  '🍤': '[shrimp]',
  '🦞': '[lobster]',
  '🦀': '[crab]',
  '🐙': '[octopus]',
  '🦑': '[squid]',
  '🐚': '[shell]',
  '🍦': '[icecream]',
  '🍧': '[shaved-ice]',
  '🍨': '[icecream]',
  '🍮': '[pudding]',
  '🍭': '[candy]',
  '🍬': '[candy]',
  '🍫': '[chocolate]',
  '🎃': '[pumpkin]',
  '🎄': '[tree]',
  '🎆': '[fireworks]',
  '🎇': '[sparkler]',
  '🧨': '[firecracker]',
  '🐶': '[dog]',
  '🐱': '[cat]',
  '🐭': '[mouse]',
  '🐹': '[hamster]',
  '🐰': '[rabbit]',
  '🦊': '[fox]',
  '🐻': '[bear]',
  '🐼': '[panda]',
  '🐨': '[koala]',
  '🐯': '[tiger]',
  '🦁': '[lion]',
  '🐮': '[cow]',
  '🐷': '[pig]',
  '🐸': '[frog]',
  '🐵': '[monkey]',
  '🙈': 'x_x',
  '🙉': 'x_x',
  '🙊': 'x_x',
  '🐔': '[chicken]',
  '🐧': '[penguin]',
  '🐦': '[bird]',
  '🦆': '[duck]',
  '🦅': '[eagle]',
  '🦉': '[owl]',
  '🦇': '[bat]',
  '🐺': '[wolf]',
  '🐗': '[boar]',
  '🐴': '[horse]',
  '🦄': '[unicorn]',
  '🐝': '[bee]',
  '🐛': '[bug]',
  '🦋': '[butterfly]',
  '🐌': '[snail]',
  '🐞': '[ladybug]',
  '🐜': '[ant]',
  '🕷️': '[spider]',
  '🕸️': '[web]',
  '🦂': '[scorpion]',
  '🐢': '[turtle]',
  '🐍': '[snake]',
  '🦎': '[lizard]',
  '🦖': '[dino]',
  '🦕': '[dino]',
  '🐙': '[octopus]',
  '🦑': '[squid]',
  '🦈': '[shark]',
  '🐳': '[whale]',
  '🐋': '[whale]',
  '🐬': '[dolphin]',
  '🐟': '[fish]',
  '🐠': '[fish]',
  '🐡': '[fish]',
  '🦐': '[shrimp]',
  '🦞': '[lobster]',
  '🦀': '[crab]',
  '🐚': '[shell]',
  '🌸': '[flower]',
  '💐': '[bouquet]',
  '🌹': '@-}--',
  '🥀': '[wilted]',
  '🌺': '[flower]',
  '🌻': '[sunflower]',
  '🌼': '[flower]',
  '🌷': '[tulip]',
  '🌱': '[sprout]',
  '🌲': '[tree]',
  '🌳': '[tree]',
  '🌴': '[palm]',
  '🌵': '[cactus]',
  '🌾': '[grain]',
  '🌿': '[herb]',
  '☘️': '[clover]',
  '🍀': '[4leaf]',
  '🍁': '[leaf]',
  '🍂': '[leaf]',
  '🍃': '[leaf]',
  '🌍': '[earth]',
  '🌎': '[earth]',
  '🌏': '[earth]',
  '🌐': '[globe]',
  '🌑': 'o',
  '🌒': 'c',
  '🌓': '(',
  '🌔': '(',
  '🌕': 'O',
  '🌖': ')',
  '🌗': ')',
  '🌘': 'c',
  '🌙': 'c',
  '🌚': 'o',
  '🌛': 'c',
  '🌜': 'c',
  '🌝': 'O',
  '⭐': '*',
  '🌟': '*',
  '💫': '*',
  '✨': '*~*',
  '☀️': '(sun)',
  '🌞': '(sun)',
  '🌤️': '(sun)',
  '⛅': '(cloud)',
  '🌥️': '(cloud)',
  '☁️': '(cloud)',
  '🌦️': '(rain)',
  '🌧️': '(rain)',
  '⛈️': '(storm)',
  '🌩️': '(lightning)',
  '🌨️': '(snow)',
  '❄️': '*',
  '☃️': '[snowman]',
  '⛄': '[snowman]',
  '🌬️': '~',
  '💨': '~',
  '🌪️': '[tornado]',
  '🌫️': '~~~',
  '🌈': '[rainbow]',
  '☔': '[umbrella]',
  '💧': '.',
  '💦': '..',
  '🌊': '~~~',
  '🔥': '(fire)',
  '💥': '*BOOM*',
  '⚡': '!',
  '☄️': '*',
  '💫': '*',
  '🌠': '*~',
  '🌌': '...',
  '🌃': '[city]',
  '🏙️': '[city]',
  '🌆': '[sunset]',
  '🌇': '[sunrise]',
  '🌉': '[bridge]',
  '🎠': '[carousel]',
  '🎡': '[ferris]',
  '🎢': '[coaster]',
  '🚀': '[rocket]',
  '🛸': '[ufo]',
  '🚁': '[copter]',
  '✈️': '[plane]',
  '🚂': '[train]',
  '🚃': '[train]',
  '🚄': '[train]',
  '🚅': '[train]',
  '🚆': '[train]',
  '🚇': '[metro]',
  '🚈': '[tram]',
  '🚉': '[station]',
  '🚊': '[tram]',
  '🚝': '[mono]',
  '🚞': '[rail]',
  '🚋': '[tram]',
  '🚌': '[bus]',
  '🚍': '[bus]',
  '🚎': '[trolley]',
  '🚐': '[van]',
  '🚑': '[ambulance]',
  '🚒': '[fire-truck]',
  '🚓': '[police]',
  '🚔': '[police]',
  '🚕': '[taxi]',
  '🚖': '[taxi]',
  '🚗': '[car]',
  '🚘': '[car]',
  '🚙': '[suv]',
  '🚚': '[truck]',
  '🚛': '[truck]',
  '🚜': '[tractor]',
  '🏎️': '[racecar]',
  '🏍️': '[motorcycle]',
  '🛵': '[scooter]',
  '🚲': '[bike]',
  '🛴': '[scooter]',
  '⚽': '[ball]',
  '🏀': '[basketball]',
  '🏈': '[football]',
  '⚾': '[baseball]',
  '🥎': '[softball]',
  '🎾': '[tennis]',
  '🏐': '[volleyball]',
  '🏉': '[rugby]',
  '🎱': '[8ball]',
  '🏓': '[pingpong]',
  '🏸': '[badminton]',
  '🥅': '[goal]',
  '🏒': '[hockey]',
  '🏑': '[hockey]',
  '🥍': '[lacrosse]',
  '🏏': '[cricket]',
  '🥊': '[boxing]',
  '🥋': '[martial-arts]',
  '⛳': '[golf]',
  '🏹': '[archery]',
  '🎣': '[fishing]',
  '🥏': '[frisbee]',
  '🛹': '[skateboard]',
  '🛼': '[skate]',
  '⛸️': '[skate]',
  '🎿': '[ski]',
  '⛷️': '[ski]',
  '🏂': '[snowboard]',
  '🏋️': '[lift]',
  '🤸': '[cartwheel]',
  '⛹️': '[ball]',
  '🤾': '[handball]',
  '🏌️': '[golf]',
  '🧘': '[yoga]',
  '🏃': '[run]',
  '🚶': '[walk]',
  '🧗': '[climb]',
  '🚴': '[bike]',
  '🚵': '[mountain-bike]',
  '🤼': '[wrestle]',
  '🤽': '[polo]',
  '🤺': '[fencing]',
  '🏇': '[horse-race]',
  '⛷️': '[ski]',
  '🏂': '[snowboard]',
  '🏄': '[surf]',
  '🚣': '[row]',
  '🏊': '[swim]',
  '⛹️': '[ball]',
  '🏋️': '[lift]',
  '🚴': '[bike]',
  '🚵': '[bike]',
  '🤸': '[flip]',
  '🤼': '[wrestle]',
  '🤽': '[polo]',
  '🤾': '[handball]',
  '🤹': '[juggle]',
  '🧘': '[yoga]',
  '🛀': '[bath]',
  '🛌': '[sleep]',
  '🤝': '*shake*',
};

// Convert emojis to ASCII emoticons
function convertEmojis(text) {
  let result = text;
  
  // Replace emojis with their ASCII equivalents
  for (const [emoji, ascii] of Object.entries(EMOJI_MAP)) {
    result = result.split(emoji).join(ascii);
  }
  
  // For any remaining emojis, try to extract the emoji name in brackets
  result = result.replace(/[\u{1F300}-\u{1F9FF}]/gu, (match) => {
    // If we don't have a mapping, just remove it or replace with ?
    return '[emoji]';
  });
  
  return result;
}

// Fix apostrophes and other special characters for thermal printer
function fixSpecialChars(text) {
  return text
    .replace(/'/g, "'")  // Smart apostrophe to straight
    .replace(/'/g, "'")  // Smart apostrophe to straight
    .replace(/"/g, '"')  // Smart quote to straight
    .replace(/"/g, '"')  // Smart quote to straight
    .replace(/–/g, '-')  // En dash to hyphen
    .replace(/—/g, '-')  // Em dash to hyphen
    .replace(/…/g, '...') // Ellipsis
    .replace(/™/g, '(TM)')
    .replace(/®/g, '(R)')
    .replace(/©/g, '(C)')
    .replace(/°/g, 'deg')
    .replace(/×/g, 'x')
    .replace(/÷/g, '/')
    .replace(/±/g, '+/-')
    .replace(/≠/g, '!=')
    .replace(/≈/g, '~')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/←/g, '<-')
    .replace(/→/g, '->')
    .replace(/↑/g, '^')
    .replace(/↓/g, 'v');
}

// Wrap text to fit printer width without breaking words
function wrapText(text, maxWidth = 48) {
  const lines = [];
  const paragraphs = text.split('\n');
  
  for (const paragraph of paragraphs) {
    if (paragraph.length === 0) {
      lines.push('');
      continue;
    }
    
    const words = paragraph.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      // If word itself is longer than maxWidth, we have to break it
      if (word.length > maxWidth) {
        if (currentLine) {
          lines.push(currentLine.trim());
          currentLine = '';
        }
        // Break long word across lines
        for (let i = 0; i < word.length; i += maxWidth) {
          lines.push(word.slice(i, i + maxWidth));
        }
        continue;
      }
      
      // Check if adding this word would exceed width
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (testLine.length > maxWidth) {
        // Current line is full, push it and start new line with this word
        if (currentLine) {
          lines.push(currentLine.trim());
        }
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    // Push the last line of this paragraph
    if (currentLine) {
      lines.push(currentLine.trim());
    }
  }
  
  return lines.join('\n');
}

// Process text for thermal printing
function processText(text, wrapWidth = 48) {
  // First fix special characters
  let processed = fixSpecialChars(text);
  
  // Then convert emojis
  processed = convertEmojis(processed);
  
  // Ensure it's safe ASCII
  processed = processed.replace(/[^\x00-\x7F]/g, '?');
  
  // Apply word wrapping
  processed = wrapText(processed, wrapWidth);
  
  return processed;
}

module.exports = {
  processText,
  convertEmojis,
  fixSpecialChars,
  wrapText
};
