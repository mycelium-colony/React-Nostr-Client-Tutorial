# So You Want to Build a Nostr Client?

> This guide is intended for people who wish to learn the basics of the Nostr protocol by building a simple React client that offers basic functionality using the [nostr-tools](https://github.com/nbd-wtf/nostr-tools) library. This project was generated with Claude 3.7.

- [Architecture](/nostr-client/ARCHITECTURE.md)
- [README](/nostr-client/README.md)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nostr-client.git
cd nostr-client

# Install dependencies
npm install

# Start the development server
npm run dev
```

# The Brains

https://www.cursor.com/

# The Prompt

> This is the prompt I used to generate this Nostr client using Claude 3.7

```
In this repo I have included a directory called nostr-tools-master which contains all of the available documentation for the nostr-tools library.

Please create a new react project with bun for me.

The application should connect to some popular nostr relays and generate a feed of kind-1 notes.

It's important to also implement support for a few other things, so I'll need you to cross-reference any of the NDK documentation against the nostr-nips.

NIP-01 is Basic protocol flow description
NIP-03 will be timestamps for events (relevant to our social media note feed)
NIP-07 is especially important for launching the extension so users can authenticate (sign) events when needed.
NIP-08 handles mentions
NIP-10 Text notes and threads, this is what our feed will consist of. Kind-1 events and replies
NIP-11 is relay metadata, we should support this with an info button. Our connected relays should be visible in a side panel.
NIP-14 is a subject tag in text events.
NIP-18 is reposts.
NIP-19 will help us render nostr: events properly. There are a few types.
NIP-21 is URI scheme.
NIP-22 documents replies.
NIP-45 offers event counts which provides a mechanism for obtaining counts.

Our client should have intelligent state management. There should be a replies (x) counter utilizing nip-45 which will double as our button that takes us to a "thread view". We will need to ensure our connections to the relays don't drop when we switch to thread view, and we should retain our position in the feed when returning.

User metadata should be displayed on hover of their username.

Relay metadata should be displayed on hover of their name in the sidebar.

Please attempt to create documentation explaining how our application is built and use comments to explain the components wherever possible.
```
