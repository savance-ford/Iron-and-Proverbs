const fs = require("fs");
const path = require("path");

const challenges = {
  "prov-24-10": "Do one hard thing before noon — something you have been postponing for days.",
  "prov-4-23": "Set a guard on your mind today: decide in advance what you will and will not let in.",
  "1cor-9-27": "Add one act of physical discipline today — an extra set, a cold shower, or a fast.",
  "heb-12-11": "Embrace one painful but necessary discipline today without complaining about it.",
  "prov-12-1": "Actively seek one piece of correction today and receive it without becoming defensive.",
  "2tim-1-7": "Name one area where fear has been controlling you and take one bold step against it today.",
  "prov-16-32": "Identify your biggest emotional trigger today and practice a deliberate pause before reacting.",
  "josh-1-9": "Identify the one thing you have been afraid to start and take one concrete step toward it today.",
  "deut-31-6": "Go into your hardest task of the day knowing God goes before you — do not delay it.",
  "1cor-16-13": "Stand firm on one conviction today even if it costs you someone's approval.",
  "ps-27-1": "Declare out loud: the Lord is my light. Let that change how you carry yourself through the day.",
  "eph-6-10": "Spend 10 minutes in Scripture or prayer before turning to news, social media, or email.",
  "phil-4-6": "Replace every anxious thought today with a specific prayer — keep a running tally.",
  "1pet-5-7": "Write down your three biggest burdens and physically hand the list to God in prayer.",
  "isa-41-10": "Write down one fear you have been carrying and surrender it to God in prayer today.",
  "josh-24-15": "Declare your household's direction out loud today — where you stand and why.",
  "dan-1-8": "Draw one clear line you will not cross today, regardless of the social pressure around you.",
  "dan-3-17": "Identify one conviction you have been compromising for comfort and hold it firm today.",
  "prov-3-5": "Before any major decision today, pause and deliberately submit it to God first.",
  "heb-11-1": "Act on something you believe but cannot yet see — take the first visible step today.",
  "matt-17-20": "Pray with genuine belief over one situation you have been treating as too big for God.",
  "rom-10-17": "Read one chapter of Scripture this morning before anything else on your phone.",
  "prov-28-1": "Walk with a clear conscience today — confess and clean up anything that makes you hide.",
  "heb-13-6": "Speak up in one place where you have been silent out of fear of what others think.",
  "1kings-2-2": "Make one decision today that reflects the man you want your sons or others to remember.",
  "ps-118-6": "Stop one people-pleasing behavior today and act from conviction instead of approval.",
  "mark-10-43": "Do one act of service today that no one will see or reward you for.",
  "prov-27-17": "Reach out to one man who sharpens you — call him, do not just text.",
  "1pet-5-3": "Lead by example in one specific area today where you have only been using words.",
  "eph-5-25": "Do one sacrificial thing for your family today that costs you personal comfort.",
  "mic-6-8": "Stand up for someone today — speak truth on their behalf when it would be easier to stay quiet.",
  "eph-2-10": "Identify one good work you have been deferring and put it on your calendar today.",
  "jer-29-11": "Write down three things you believe God is calling you toward in this season of your life.",
  "col-3-23": "Take the hardest item on your list and give it full effort, as if God alone is watching.",
  "neh-6-3": "Name the one distraction that most pulls you from your primary calling and cut it today.",
  "2tim-2-21": "Remove one dishonorable habit today — name it, refuse it once, and replace it with something better.",
  "isa-40-31": "Sit in complete silence before God for 10 minutes today — no phone, no noise.",
  "jas-1-4": "Stay steady in your hardest current trial today without trying to shortcut your way out.",
  "gal-6-9": "Press on in one area where you have been tempted to quit — log the work regardless of results.",
  "ps-37-7": "Stop tracking someone else's progress today and focus entirely on your own faithfulness.",
  "prov-22-29": "Go above and beyond in one area of your work today — bring excellence, not adequacy.",
  "eccl-9-10": "Bring your full effort to the very first task on your list today, not just the comfortable ones.",
  "prov-10-4": "Identify one area of laziness in your work life and address it with direct action today.",
  "jas-1-19": "In your next difficult conversation, listen completely before forming any response.",
  "eph-4-26": "If you are carrying unresolved anger, address it today — call, write, or pray through it.",
  "prov-15-1": "In your next tense interaction, consciously lower your tone and observe what changes.",
  "rom-12-19": "Write down one grievance you have been holding and release it to God in prayer today.",
  "ps-46-1": "In your next stressful moment, stop and say aloud: God is my refuge and strength.",
  "matt-11-28": "Name your heaviest current burden in prayer and leave it at the feet of Christ today.",
  "john-14-27": "When anxiety rises today, deliberately speak peace over your own mind as an act of faith.",
  "ps-90-12": "Treat today as irreplaceable — write the one thing that matters most and do it first.",
  "2tim-4-7": "Identify where you have been coasting and recommit today to finishing strong.",
  "1tim-4-7-8": "Add 20 minutes of spiritual training to your day: prayer, journaling, or memorizing Scripture.",
  "ps-1-1": "Audit who or what influenced your thinking this past week and cut one negative input.",
  "gal-5-23": "Pick one area where the flesh has been winning and take one proactive spiritual step against it.",
  "2cor-10-5": "At the first tempting thought today, immediately redirect it with a verse or short prayer.",
  "rom-13-14": "Remove one thing from your environment today that consistently feeds a weakness.",
  "prov-21-5": "Before any purchase or commitment today, ask: is this planned or is it just impulse?",
  "deut-8-18": "Thank God specifically for one concrete provision before you begin working today.",
  "1cor-4-2": "Show up faithfully to one responsibility today that no one else sees or tracks.",
  "ps-119-105": "Navigate one decision today by Scripture alone — look up a relevant passage first.",
  "phil-4-13": "Attempt one thing today that feels beyond your own strength and ask Christ to carry it.",
  "2cor-12-9": "Admit one weakness to a trusted person today — stop pretending you have it fully together.",
  "lam-3-22": "Start your morning by speaking God's faithfulness over today before looking at your problems.",
  "prov-11-2": "Find one moment today to serve someone without drawing any attention to yourself.",
  "prov-20-7": "In one interaction today, model the integrity you want your children to inherit.",
  "prov-21-31": "Prepare fully as if everything depends on you, then trust God as if everything depends on Him.",
  "2cor-4-17": "Reframe your current hardship today: write how this trial might produce something eternal.",
  "ps-37-23": "Review your schedule for today and look for where God may have arranged your steps.",
  "phil-3-14": "Stop reviewing past failures today — press forward and do the next right thing.",
  "heb-12-1": "Identify one weight in your life that is slowing you down and decide to lay it aside.",
  "luke-9-23": "Deny yourself one comfort today that you normally take for granted.",
  "rom-12-1": "Offer your body as a living sacrifice today: discipline, service, and surrender in one action.",
  "col-3-2": "Set your mind on something eternal this morning before setting it on anything temporary.",
  "prov-13-20": "Evaluate who you spent the most time with this week — do they sharpen or soften you?",
  "ps-34-18": "Reach out to one broken person today — show up for them the way God shows up for you.",
  "prov-17-17": "Be the brother who shows up today in someone's adversity — call, go, or pray with them.",
};

const filePath = path.join(__dirname, "../data/verses.json");
const verses = JSON.parse(fs.readFileSync(filePath, "utf8"));

let updated = 0;
verses.forEach((v) => {
  if (challenges[v.id] && !v.challenge) {
    v.challenge = challenges[v.id];
    updated++;
  }
});

fs.writeFileSync(filePath, JSON.stringify(verses, null, 2));
console.log("Updated:", updated, "verses");
console.log("With challenge:", verses.filter((v) => v.challenge).length);
console.log("Using fallback:", verses.filter((v) => !v.challenge).length);
