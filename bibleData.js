/* ═══════════════════════════════════════════════════════════
   BIBLE DATA LAYER (KJV — Public Domain)
   ═══════════════════════════════════════════════════════════
   Structure:
     BIBLE[bookName][chapterNumber] = [verse1, verse2, ...]
   Verses are 1-indexed in source, but stored as a 0-indexed array.
     - To get verse N, use:  BIBLE.Genesis[1][N - 1]
   This is a starter sample. Add more chapters/books over time
   without changing the structure or any consuming code.
   ═══════════════════════════════════════════════════════════ */

const BIBLE = {
  Genesis: {
    1: [
      "In the beginning God created the heaven and the earth.",
      "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.",
      "And God said, Let there be light: and there was light.",
      "And God saw the light, that it was good: and God divided the light from the darkness.",
      "And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.",
      "And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters.",
      "And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so.",
      "And God called the firmament Heaven. And the evening and the morning were the second day.",
      "And God said, Let the waters under the heaven be gathered together unto one place, and let the dry land appear: and it was so.",
      "And God called the dry land Earth; and the gathering together of the waters called he Seas: and God saw that it was good.",
      "And God said, Let the earth bring forth grass, the herb yielding seed, and the fruit tree yielding fruit after his kind, whose seed is in itself, upon the earth: and it was so.",
      "And the earth brought forth grass, and herb yielding seed after his kind, and the tree yielding fruit, whose seed was in itself, after his kind: and God saw that it was good.",
      "And the evening and the morning were the third day.",
      "And God said, Let there be lights in the firmament of the heaven to divide the day from the night; and let them be for signs, and for seasons, and for days, and years:",
      "And let them be for lights in the firmament of the heaven to give light upon the earth: and it was so.",
      "And God made two great lights; the greater light to rule the day, and the lesser light to rule the night: he made the stars also.",
      "And God set them in the firmament of the heaven to give light upon the earth,",
      "And to rule over the day and over the night, and to divide the light from the darkness: and God saw that it was good.",
      "And the evening and the morning were the fourth day.",
      "And God said, Let the waters bring forth abundantly the moving creature that hath life, and fowl that may fly above the earth in the open firmament of heaven.",
      "And God created great whales, and every living creature that moveth, which the waters brought forth abundantly, after their kind, and every winged fowl after his kind: and God saw that it was good.",
      "And God blessed them, saying, Be fruitful, and multiply, and fill the waters in the seas, and let fowl multiply in the earth.",
      "And the evening and the morning were the fifth day.",
      "And God said, Let the earth bring forth the living creature after his kind, cattle, and creeping thing, and beast of the earth after his kind: and it was so.",
      "And God made the beast of the earth after his kind, and cattle after their kind, and every thing that creepeth upon the earth after his kind: and God saw that it was good.",
      "And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth, and over every creeping thing that creepeth upon the earth.",
      "So God created man in his own image, in the image of God created he him; male and female created he them.",
      "And God blessed them, and God said unto them, Be fruitful, and multiply, and replenish the earth, and subdue it: and have dominion over the fish of the sea, and over the fowl of the air, and over every living thing that moveth upon the earth.",
      "And God said, Behold, I have given you every herb bearing seed, which is upon the face of all the earth, and every tree, in the which is the fruit of a tree yielding seed; to you it shall be for meat.",
      "And to every beast of the earth, and to every fowl of the air, and to every thing that creepeth upon the earth, wherein there is life, I have given every green herb for meat: and it was so.",
      "And God saw every thing that he had made, and, behold, it was very good. And the evening and the morning were the sixth day."
    ],
    2: [
      "Thus the heavens and the earth were finished, and all the host of them.",
      "And on the seventh day God ended his work which he had made; and he rested on the seventh day from all his work which he had made.",
      "And God blessed the seventh day, and sanctified it: because that in it he had rested from all his work which God created and made.",
      "These are the generations of the heavens and of the earth when they were created, in the day that the LORD God made the earth and the heavens,",
      "And every plant of the field before it was in the earth, and every herb of the field before it grew: for the LORD God had not caused it to rain upon the earth, and there was not a man to till the ground.",
      "But there went up a mist from the earth, and watered the whole face of the ground.",
      "And the LORD God formed man of the dust of the ground, and breathed into his nostrils the breath of life; and man became a living soul.",
      "And the LORD God planted a garden eastward in Eden; and there he put the man whom he had formed."
    ]
  },

  Psalms: {
    23: [
      "The LORD is my shepherd; I shall not want.",
      "He maketh me to lie down in green pastures: he leadeth me beside the still waters.",
      "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.",
      "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.",
      "Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.",
      "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever."
    ]
  },

  Mark: {
    1: [
      "The beginning of the gospel of Jesus Christ, the Son of God;",
      "As it is written in the prophets, Behold, I send my messenger before thy face, which shall prepare thy way before thee.",
      "The voice of one crying in the wilderness, Prepare ye the way of the Lord, make his paths straight.",
      "John did baptize in the wilderness, and preach the baptism of repentance for the remission of sins.",
      "And there went out unto him all the land of Judaea, and they of Jerusalem, and were all baptized of him in the river of Jordan, confessing their sins.",
      "And John was clothed with camel's hair, and with a girdle of a skin about his loins; and he did eat locusts and wild honey;",
      "And preached, saying, There cometh one mightier than I after me, the latchet of whose shoes I am not worthy to stoop down and unloose.",
      "I indeed have baptized you with water: but he shall baptize you with the Holy Ghost.",
      "And it came to pass in those days, that Jesus came from Nazareth of Galilee, and was baptized of John in Jordan.",
      "And straightway coming up out of the water, he saw the heavens opened, and the Spirit like a dove descending upon him:",
      "And there came a voice from heaven, saying, Thou art my beloved Son, in whom I am well pleased.",
      "And immediately the Spirit driveth him into the wilderness.",
      "And he was there in the wilderness forty days, tempted of Satan; and was with the wild beasts; and the angels ministered unto him.",
      "Now after that John was put in prison, Jesus came into Galilee, preaching the gospel of the kingdom of God,",
      "And saying, The time is fulfilled, and the kingdom of God is at hand: repent ye, and believe the gospel.",
      "Now as he walked by the sea of Galilee, he saw Simon and Andrew his brother casting a net into the sea: for they were fishers.",
      "And Jesus said unto them, Come ye after me, and I will make you to become fishers of men.",
      "And straightway they forsook their nets, and followed him.",
      "And when he had gone a little further thence, he saw James the son of Zebedee, and John his brother, who also were in the ship mending their nets.",
      "And straightway he called them: and they left their father Zebedee in the ship with the hired servants, and went after him."
    ]
  },

  John: {
    1: [
      "In the beginning was the Word, and the Word was with God, and the Word was God.",
      "The same was in the beginning with God.",
      "All things were made by him; and without him was not any thing made that was made.",
      "In him was life; and the life was the light of men.",
      "And the light shineth in darkness; and the darkness comprehended it not.",
      "There was a man sent from God, whose name was John.",
      "The same came for a witness, to bear witness of the Light, that all men through him might believe.",
      "He was not that Light, but was sent to bear witness of that Light.",
      "That was the true Light, which lighteth every man that cometh into the world.",
      "He was in the world, and the world was made by him, and the world knew him not.",
      "He came unto his own, and his own received him not.",
      "But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name:",
      "Which were born, not of blood, nor of the will of the flesh, nor of the will of man, but of God.",
      "And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth."
    ]
  }
};

window.BIBLE = BIBLE;
console.log('[bibleData.js] Loaded.', window.BIBLE);
