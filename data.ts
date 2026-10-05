type RealWebsiteData = {
  name: string;
  // dont include index.html, it is assumed
  // dont include .html
  pages: string[];
}

type DeadWebsiteData = {
  name: string;
  seized: boolean;
}

export const REAL_WEBSITES: RealWebsiteData[] = [
  {
    name: 'Bizarre Propagation',
    pages: []
  },
  {
    name: 'Blackhat Post',
    pages: ['submit']
  },
  {
    name: 'Blushing Brides',
    pages: ['join', 'samples']
  },
  {
    name: 'Building A Future',
    pages: ['invest']
  },
  {
    name: 'Cavity Lease',
    pages: ['submit']
  },
  {
    name: 'Chevron',
    pages: []
  },
  {
    name: 'Crisis Calls',
    pages: ['account', 'resetpassword']
  },
  {
    name: 'Crystal Guild',
    pages: ['welcome']
  },
  {
    name: 'Doctor Murder',
    pages: []
  },
  {
    name: 'Don\'t Waste It',
    pages: ['holdit', 'no', 'yes']
  },
  {
    name: 'Doughy',
    pages: []
  },
  {
    name: 'Drug Tickets',
    pages: ['checkout', 'error']
  },
  {
    name: 'Eat My Shit',
    pages: ['faq', 'questions', 'secret']
  },
  {
    name: 'Encrave',
    pages: ['gateopen', 'evident']
  },
  {
    name: 'finalStanding',
    pages: []
  },
  {
    name: 'FindLove',
    pages: []
  },
  {
    name: 'Forever Friend',
    pages: ['order']
  },
  {
    name: 'Forsaken Gifts',
    pages: ['gifts', 'order']
  },
  {
    name: 'I Am Here',
    pages: []
  },
  {
    name: 'Jakobs Sink',
    pages: []
  },
  {
    name: 'Keep Sake',
    pages: ['thesearch', 'contact']
  },
  {
    name: 'Kill For Me',
    pages: ['instructions', 'targets']
  },
  {
    name: 'Lab Monkey',
    pages: ['catalog', 'sign-in', 'error']
  },
  {
    name: 'LostTapes',
    pages: ['page2', 'purchase']
  },
  {
    name: 'MamaBruguglio',
    pages: []
  },
  {
    name: 'Mors N More Market',
    pages: ['menu', 'order', 'ordersent']
  },
  {
    name: 'Oneless',
    pages: []
  },
  {
    name: 'Order Of Nine',
    pages: ['join']
  },
  {
    name: 'Overnight Success',
    pages: ['purchase']
  },
  {
    name: 'Prohibited Stockpile',
    pages: ['nocontent']
  },
  {
    name: 'Red Handed',
    pages: ['login', 'post1', 'post2', 'post4', 'post6']
  },
  {
    name: 'Red Triangle',
    pages: []
  },
  {
    name: 'Ring Ring',
    pages: ['answer']
  },
  {
    name: 'Shelter',
    pages: ['events', 'donate']
  },
  {
    name: 'Symphoros Chosen',
    pages: ['sendlinks', 'live']
  },
  {
    name: 'Synapse Decay',
    pages: ['getmoney', 'myfriends', 'occasionally', 'succulentmeal']
  },
  {
    name: 'Tango Down',
    pages: ['hire', 'payment', 'results']
  },
  {
    name: 'Thanks For Visiting!',
    pages: ['bar', 'connected', 'creepy', 'fakemain', /*'index',*/ 'jolly', 'plug', 'portal', 'sleeptalk', 'slide2', 'smile', 'ulike', 'vision']
  },
  {
    name: 'The Bomb Maker',
    pages: []
  },
  {
    name: 'The Grey',
    pages: ['inanis', 'centrum', 'interius', 'latus']
  },
  {
    name: 'The Hall',
    pages: []
  },
  {
    name: 'The Hole',
    pages: []
  },
  {
    name: 'The Light Within',
    pages: ['saved']
  },
  {
    name: 'The Loogaroo',
    pages: ['locations']
  },
  {
    name: 'The Prey',
    pages: []
  },
  {
    name: 'Time Sharing',
    pages: ['packages', 'watch']
  },
  {
    name: 'TRACK06',
    pages: []
  },
  {
    name: 'ViaMarisRoute',
    pages: ['order', 'secondpage', 'thirdpage']
  },
  {
    name: 'VoluVision',
    pages: ['testimonials', 'purchase']
  },
  {
    name: 'World Wide Workers',
    pages: ['about', 'submit']
  },
  {
    name: 'You There?',
    pages: []
  }
]

export const DEAD_WEBSITES: DeadWebsiteData[] = [
  {
    name: 'Abyssal Chat',
    seized: false
  },
  {
    name: 'Bathroom Cams',
    seized: false
  },
  {
    name: 'Bone Altar',
    seized: false
  },
  {
    name: 'Carrion Stage',
    seized: false
  },
  {
    name: 'Corpses For Sale',
    seized: false
  },
  {
    name: 'Crimson Bazaar',
    seized: false
  },
  {
    name: 'Crimson Relay',
    seized: false
  },
  {
    name: 'Cryptic Forge',
    seized: true
  },
  {
    name: 'Deep Journal',
    seized: false
  },
  {
    name: 'Dread Signal',
    seized: false
  },
  {
    name: 'Drone Spy',
    seized: false
  },
  {
    name: 'Dusk Haven',
    seized: true
  },
  {
    name: 'Echo Vault',
    seized: false
  },
  {
    name: 'Eternal Loop',
    seized: false
  },
  {
    name: 'Evidence Locker',
    seized: true
  },
  {
    name: 'Father Donald',
    seized: false
  },
  {
    name: 'Flicker Stream',
    seized: false
  },
  {
    name: 'Foot Doctor',
    seized: false
  },
  {
    name: 'Forgive Me',
    seized: false
  },
  {
    name: 'Ghost Proxy',
    seized: false
  },
  {
    name: 'Gloom Archive',
    seized: false
  },
  {
    name: 'Hidden Pleasures',
    seized: true
  },
  {
    name: 'Hollow Key',
    seized: false
  },
  {
    name: 'Iron Ledger',
    seized: false
  },
  {
    name: 'Iron Mask',
    seized: true
  },
  {
    name: 'Is Evil',
    seized: true
  },
  {
    name: 'Lost Signals',
    seized: false
  },
  {
    name: 'Murk Lair',
    seized: false
  },
  {
    name: 'Mutilation',
    seized: false
  },
  {
    name: 'My Backroom',
    seized: false
  },
  {
    name: 'My Gut',
    seized: false
  },
  {
    name: 'Noir Gallery',
    seized: false
  },
  {
    name: 'Obsidian Trade',
    seized: false
  },
  {
    name: 'Pale Market',
    seized: true
  },
  {
    name: 'Phantom Lot',
    seized: false
  },
  {
    name: 'Red Veil',
    seized: false
  },
  {
    name: 'Roses Destruction',
    seized: true
  },
  {
    name: 'Rust Network',
    seized: false
  },
  {
    name: 'Secure Drop',
    seized: false
  },
  {
    name: 'Shade Broker',
    seized: false
  },
  {
    name: 'Shadow Cache',
    seized: false
  },
  {
    name: 'Silent Auction',
    seized: false
  },
  {
    name: 'Specter Hub',
    seized: false
  },
  {
    name: 'The Black Waves',
    seized: false
  },
  {
    name: 'The Butcher',
    seized: false
  },
  {
    name: 'The End Of NY',
    seized: false
  },
  {
    name: 'Veiled Eyes',
    seized: false
  },
  {
    name: 'Void Library',
    seized: false
  },
  {
    name: 'Wraith Cam',
    seized: false
  }
]