import { useState } from 'react';
import { createPortal } from 'react-dom';
import './Rulebook.css';

// Card Images
const CARD_IMAGES = {
  attack: '/assets/cards/attack/0.png',
  skip: '/assets/cards/skip/0.png',
  favor: '/assets/cards/favor/0.png',
  shuffle: '/assets/cards/shuffle/0.png',
  seeFuture: '/assets/cards/see_the_future/0.png',
  nope: '/assets/cards/nope/0.png',
  defuse: '/assets/cards/defuse/0.png',
  exploding: '/assets/cards/exploding_kitten/0.png',
  catCard: '/assets/cards/cat_card/0.png',
};

export function RulebookModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="rulebook-modal-wrapper">
      <div className="rulebook-backdrop" onClick={onClose} />
      <div className="rulebook-content">
        <div className="rulebook-header">
          <h2>OFFICIAL RULES</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        <div className="rulebook-body">
          <section className="rule-section">
            <h3>HOW IT WORKS</h3>
            <p>
              In the deck of cards are some Exploding Kittens. You play the game by putting the deck face down and taking turns drawing cards until someone draws an Exploding Kitten.
            </p>
            <p>
              When that happens, that person explodes. They are now dead and out of the game.
            </p>
            <p>
              This process continues until there’s only 1 player left, who wins the game.
            </p>
          </section>

          <section className="rule-section">
            <h3>BASICALLY</h3>
            <p>
              If you explode, you lose. If you don’t explode, YOU WIN. And all of the other cards will lessen your chances of getting exploded by Exploding Kittens.
            </p>
          </section>

          <section className="rule-section">
            <h3>TAKING YOUR TURN</h3>
            <ol>
              <li>Loot at the cards in your hand. Do one of the following:
                <ul>
                  <li><strong>Play no cards.</strong></li>
                  <li><strong>Play as many cards as you want</strong></li>
                </ul>
              </li>
              <li>
                <strong>End your turn by drawing a card</strong> from the top of the Draw Pile and hope it’s not an Exploding Kitten.
              </li>
            </ol>
          </section>
          
          <section className="rule-section">
            <h3>THREE MORE THINGS</h3>
             <ul>
                 <li>A good strategy is to save your cards early in the game while your chance of exploding is low.</li>
                 <li>You can always count the cards left in the Draw Pile to figure out the odds of exploding.</li>
                 <li>There is no maximum or minimum hand size. If you run out of cards in your hand, there’s no special action to take. Keep playing. You’ll draw at least 1 more card on your next turn.</li>
             </ul>
          </section>

          <section className="rule-section">
            <h3>CARD GUIDE</h3>
            <div className="card-list">
              <div className="card-item">
                <img src={CARD_IMAGES.exploding} alt="Exploding Kitten" />
                <div className="card-info">
                  <h4>Exploding Kitten</h4>
                  <p>You must show this card immediately. Unless you have a Defuse Card, you’re dead. Discard all of your cards, including the Exploding Kitten.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.defuse} alt="Defuse" />
                <div className="card-info">
                  <h4>Defuse</h4>
                  <p>If you draw an Exploding Kitten, instead of getting exploded, you can play the Defuse Card and reinsert the Kitten back into the Draw Pile anywhere you’d like in secret. Try to get as many Defuse Cards as possible.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.attack} alt="Attack" />
                <div className="card-info">
                  <h4>Attack</h4>
                  <p>Immediately end your turn(s) without drawing and force the next player to take 2 turns in a row. The victim of this card takes a turn as normal. Then, when their first turn is over, it’s their turn again. (If the victim of an Attack Card plays an Attack Card, their turns are immediately over, and the next player must take their turns and two additional.)</p>
                </div>
              </div>
              
              <div className="card-item">
                 <img src={CARD_IMAGES.skip} alt="Skip" />
                 <div className="card-info">
                    <h4>Skip</h4>
                    <p>Immediately end your turn without drawing a card. (If you play a Skip Card as a defense to an Attack Card, it only ends 1 of the 2 turns. 2 Skip Cards would end both turns.)</p>
                 </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.favor} alt="Favor" />
                <div className="card-info">
                  <h4>Favor</h4>
                  <p>Force any other player to give you 1 card from their hand. They choose which card to give you.</p>
                </div>
              </div>
              
              <div className="card-item">
                 <img src={CARD_IMAGES.shuffle} alt="Shuffle" />
                 <div className="card-info">
                    <h4>Shuffle</h4>
                    <p>Shuffle the Draw Pile without viewing the cards. (Useful when you know there’s an Exploding Kitten coming.)</p>
                 </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.seeFuture} alt="See The Future" />
                <div className="card-info">
                  <h4>See The Future</h4>
                  <p>Peek at the top three cards from the Draw Pile and put them back in the same order. Don’t show the cards to the other players..</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.nope} alt="Nope" />
                <div className="card-info">
                  <h4>Nope</h4>
                  <p>Stop any action except for an Exploding Kitten or a Defuse Card. Imagine that any card beneath a Nope Card never existed. You can play a Nope Card at any time before an action has begun, even if it’s not your turn. Any cards that have been noped are lost. Leave them in the Discard Pile. You can even play a Nope on another Nope.</p>
                </div>
              </div>

              <div className="card-item">
                <img src={CARD_IMAGES.catCard} alt="Cat Cards" />
                <div className="card-info">
                  <h4>Cat Cards</h4>
                  <p>These cards are powerless on their own, but if you collect any 2 matching Cat Cards, you can play them as a Pair to steal a random card from any other player.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function RulebookButton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button className="open-rules-btn" onClick={() => setIsOpen(true)} aria-label="Open Rules">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
           <circle cx="12" cy="12" r="10"></circle>
           <line x1="12" y1="16" x2="12" y2="12"></line>
           <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </button>
      <RulebookModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
