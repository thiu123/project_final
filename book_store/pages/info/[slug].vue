<template>
  <div style="min-height: 100vh">
    <div v-if="loading" class="d-flex justify-center align-center h-screen">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    <div v-else>
      <img
        height="700px"
        v-if="info.thumb_url"
        width="100%"
        :src="info.thumb_url"
        :alt="info.origin_name"
        class="mx-auto"
        cover
      />
      <v-card
        class="elevation-16 mt-3 d-flex bg-customblack mx-auto rounded-lg"
        style="width: 95%"
      >
        <v-row>
          <v-col cols="4" class="d-flex flex-column">
            <img
              v-if="info.poster_url"
              style="width: 200px; height: 300px"
              :src="info.poster_url"
              :alt="info.origin_name"
              cover
              class="rounded-lg"
            />
            <span class="font-weight-bold text-white text-h5 mt-2">{{
              info.name
            }}</span>
            <span class="text-customyellow">{{ info.origin_name }}</span>
            <div class="d-flex align-center mt-2" style="gap: 15px">
              <div
                v-for="(type, index) in info.category"
                :key="index"
                class="rounded-lg pa-1 text-subtitle-2"
                style="border: 1px solid white"
              >
                {{ type.name }}
              </div>
            </div>
            <div class="d-flex flex-column mt-2">
              <span class="font-weight-bold">Introduction</span>
              <span>{{ info.content }}</span>
            </div>
            <div class="d-flex align-center mt-1" style="gap: 5px">
              <span class="font-weight-bold">Country:</span>
              <span v-for="(item, index) in info.country" :key="index">{{
                item.name
              }}</span>
            </div>
            <div class="d-flex align-center mt-1" style="gap: 5px">
              <span class="font-weight-bold">Director:</span>
              <span v-for="(item, index) in info.director" :key="index">{{
                item
              }}</span>
            </div>
            <div class="d-flex align-center mt-1">
              <span class="font-weight-bold mr-1">Runtime:</span>
              <span v-for="(item, index) in info.time" :key="index">{{
                item
              }}</span>
            </div>
          </v-col>
          <v-col cols="8">
            <div class="d-flex align-center" style="gap: 10px">
              <v-btn color="primary">
                <v-icon start>mdi-eye</v-icon>
                Xem ngay !
              </v-btn>
              <v-btn>
                <v-icon start>mdi-heart</v-icon>
                Yêu thích
              </v-btn>
              <v-btn>
                <v-icon start>mdi-plus</v-icon>
                Thêm vào
              </v-btn>
              <v-btn>
                <v-icon start>mdi-share-variant</v-icon>
                Chia sẻ
              </v-btn>
              <v-btn>
                <v-icon start>mdi-comment</v-icon>
                Bình luận
              </v-btn>
            </div>
            <div>
              <v-tabs v-model="tab">
                <v-tab value="tập-phim">Tập phim</v-tab>
                <v-tab value="diễn-viên">Diễn viên</v-tab>
                <v-tab value="đề-xuất">Đề xuất</v-tab>
              </v-tabs>

              <v-card-text>
                <v-tabs-window v-model="tab">
                  <v-tabs-window-item value="tập-phim">
                    <h3>Tập phim</h3>
                    <v-row dense>
                      <v-col
                        cols="auto"
                        v-for="(episode, index) in takeEpisodes"
                        :key="index"
                      >
                        <v-btn elevation="24" class="mt-2 text-subtitle-1 custom-btn" color="white">
                          {{ episode }}
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-tabs-window-item>

                  <v-window-item value="diễn-viên">
                    <h3>Diễn viên</h3>
                    <v-row>
                      <v-col
                        cols="3"
                        v-for="(actor, index) in info.actor"
                        :key="index"
                      >
                        <v-avatar color="grey" rounded="0" size="150">
                          <v-img
                            src="https://cdn.vuetifyjs.com/images/profiles/marcus.jpg"
                            cover
                          ></v-img>
                        </v-avatar>
                        <v-list-item
                          class="text-white"
                          :title="actor"
                        ></v-list-item>
                      </v-col>
                    </v-row>
                  </v-window-item>

                  <v-window-item value="đề-xuất">
                    <h3>Đề xuất</h3>
                    <p>Các đề xuất sẽ được hiển thị ở đây.</p>
                  </v-window-item>
                </v-tabs-window>
              </v-card-text>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters, mapMutations } from "vuex";
import info from "~/store/info";
// import axios from "axios";
export default {
  data() {
    return {
      tab: "tập-phim",
      loading: true,
    };
  },
  computed: {
    ...mapState("info", ["info", "episodes"]),
    ...mapGetters("info", ["takeEpisodes"]),
  },
  methods: {
    ...mapMutations("info", ["resetMovieBeforeFetch"]),
    ...mapActions("info", ["fetchInfoEpisodesMovie"]),
  },
  async mounted() {
    this.resetMovieBeforeFetch();
    try {
      await this.fetchInfoEpisodesMovie(this.$route.params.slug);
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  },
};
</script>

<style scoped>
.custom-btn:hover {
  color: #F4CE70 !important;
}
</style>
