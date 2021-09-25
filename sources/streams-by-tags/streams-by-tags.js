const common = require("../common-polling.js");
const twitch = require("../../twitch.app.js");

module.exports = {
  ...common,
  name: "Streams By Tags and Language",
  key: "twitch-streams-by-tags",
  description:
    "Emits an event when a live stream starts from any stream matching the tags and language specified.",
  version: "0.0.1",
  props: {
    ...common.props,
    language: { propDefinition: [twitch, "language"] },
    tagsId: { propDefinition: [twitch, "tagsId"] }
  },
  methods: {
    ...common.methods,
    getMeta({ id, title: summary, started_at: startedAt }) {
      const ts = new Date(startedAt).getTime();
      return {
        id: `${id}${ts}`,
        summary,
        ts,
      };
    },
  },
  async run() {
    // get and emit streams for the specified language
    const streams = await this.paginate(
      this.twitch.getStreams.bind(this),
      {
        language: this.language,
        first: 100,
      },
      10000
    );

    for await (const tag of this.tagsId.split(",")) {
      for await (const stream of streams) {
        if(!!stream.tag_ids && stream.tag_ids.includes(tag)) {
          this.$emit(stream, this.getMeta(stream));        
        }
      }
    }
  },
};