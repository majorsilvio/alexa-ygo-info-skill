const config = require("../config.js");

const rp = require("request-promise");

const mainHandler = {
  LaunchRequest: function () {
    this.response.cardRenderer(config.HELP_MESSAGE);
    this.response.speak(config.HELP_MESSAGE);
    this.response.listen(config.HELP_REPROMPT);
    this.emit(":responseReady");
  },

  GetInfoIntent: function () {
    const cardname = this.event.request.intent.slots.cardname.value;

    let RESPONSE_TEXT = "Você quer saber informações sobre a carta " + cardname;

    if (!cardname) {
      RESPONSE_TEXT = "Você precisa fornecer o nome da carta. Por favor, tente novamente!";
      this.response.speak(RESPONSE_TEXT);
      this.response.listen(config.HELP_REPROMPT);
      this.emit(":responseReady");
    }

    rp(config.URL, {
      qs: {
        fname: cardname,
      },
    })
      .then((body) => {
        const result = JSON.parse(body);
        let card = result["data"][0];

        if (!card) {
          RESPONSE_TEXT =
            "Desculpe, nao conseguimos encontrar a carta. Por favor, tente novamente!";
          this.response.speak(RESPONSE_TEXT);
          this.response.listen(config.HELP_REPROMPT);
          this.emit(":responseReady");
        }
        const mountResponse = (card) => {
          const {
            name,
            type,
            frameType,
            atk,
            def,
            level,
            attribute,
            race,
            card_prices,
          } = card;
          const price = card_prices[0].tcgplayer_price;

          if (frameType === "spell" || frameType === "trap") {
            return `A carta ${name} é do tipo ${type} e seu custo é de ${price} de dólares.`;
          }

          const linkRate = card.linkval;
          const pendulumScale = card.scale;

          return `A carta ${name} é do tipo ${type}, ${
            frameType === "link"
              ? `${atk} de ataque, ${linkRate} setas links`
              : `${level} de level${
                  pendulumScale ? ` com a escala pendulum ${pendulumScale}` : ""
                }, ${atk} de ataque e ${def} de defesa`
          }, tem o atributo ${attribute} e seu tipo é ${race}, atualmente ela custa cerca de ${price} de dólares.`;
        };
        // console.log(card);
        RESPONSE_TEXT = mountResponse(card);

        this.response.cardRenderer(RESPONSE_TEXT);
        this.response.speak(RESPONSE_TEXT);
        this.emit(":responseReady");
      })
      .catch((err) => {
        RESPONSE_TEXT = `Houve um erro ao buscar a carta ${cardname}. Por favor, tente novamente.`;
        console.log(RESPONSE_TEXT + err);
        this.response.cardRenderer(RESPONSE_TEXT);
        this.response.speak(RESPONSE_TEXT);
        this.emit(":responseReady");
      });
  },
  GetPriceIntent: function () {
    const cardname = this.event.request.intent.slots.cardname.value;

    let RESPONSE_TEXT = "Você quer saber o preço sobre a carta " + cardname;

    if (!cardname) {
      RESPONSE_TEXT = "Você precisa fornecer o nome da carta. Por favor, tente novamente!";
      this.response.speak(RESPONSE_TEXT);
      this.response.listen(config.HELP_REPROMPT);
      this.emit(":responseReady");
    }

    rp(config.URL, {
      qs: {
        fname: cardname,
      },
    })
      .then((body) => {
        const result = JSON.parse(body);
        let card = result["data"][0];

        if (!card) {
          RESPONSE_TEXT =
            "Desculpe, nao conseguimos encontrar a carta. Por favor, tente novamente!";
          this.response.speak(RESPONSE_TEXT);
          this.response.listen(config.HELP_REPROMPT);
          this.emit(":responseReady");
        }
        const {
          name,
          card_prices,
        } = card;
        const price = card_prices[0].tcgplayer_price;
        RESPONSE_TEXT = `A carta ${name} custa cerca de ${price} de dólares.`;

        this.response.cardRenderer(RESPONSE_TEXT);
        this.response.speak(RESPONSE_TEXT);
        this.emit(":responseReady");
      })
      .catch((err) => {
        RESPONSE_TEXT = `Houve um erro ao buscar a carta ${cardname}. Por favor, tente novamente.`;
        console.log(RESPONSE_TEXT + err);
        this.response.cardRenderer(RESPONSE_TEXT);
        this.response.speak(RESPONSE_TEXT);
        this.emit(":responseReady");
      });
  },
  Unhandled: function () {
    this.response.speak(
      "Desculpe, eu não entendi o que você quis dizer. Por favor, tente novamente."
    );
    this.response.listen(config.HELP_REPROMPT);
    this.emit(":responseReady");
  },
};

module.exports = mainHandler;
