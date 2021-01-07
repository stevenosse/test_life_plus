<template>
  <div class="home">
    <div id="main">
      <div class="main-actions">
        <input
          type="file"
          ref="data"
          @change="importData"
          style="display: none"
        />
        <button @click="$refs.data.click()">Importer un fichier</button>
        <button @click="exportData()">Exporter</button>
        <button @click="nextGeneration()">Prochaine Génération</button>
        <button @click="autoPlay()">Auto Play</button>
      </div>

      <div class="generation-number">Génération numéro : {{ generationNumber }}</div>

      <table cellspacing="0" cellpadding="0">
        <tr v-for="(n, i) in gridSize" :key="i">
          <td
            v-for="(m, j) in gridSize"
            :key="j * 50"
            :class="{ active: [...gridData[i]][j] }"
          >
            {{ j }}
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style lang="css">
</style>

<script>
const baseUrl = "http://localhost:4000";
export default {
  name: "Home",
  data() {
    return {
      gridSize: 30,
      gridData: [],
      generationNumber: 0,
      autoplay: false,
      autoplayInterval: null,
    };
  },
  mounted() {},
  methods: {
    importData(event) {
      var data = new FormData();
      data.append("data", event.target.files[0]);

      fetch(`${baseUrl}/import`, {
        method: "POST",
        body: data,
      })
        .then((response) => response.json())
        .then((response) => {
          this.generationNumber = 0
          this.autoplay = false
          this.gridData = response.gridData;
          this.gridSize = response.gridSize;
        });
    },

    autoPlay() {
      if (this.autoplay) {
        clearInterval(this.autoplayInterval);
        this.autoplay = false;
      } else {
        this.autoplayInterval = setInterval(() => {
          this.nextGeneration();
        }, 200);
        this.autoplay = true;
      }
    },

    nextGeneration() {
      /**
       * Une cellule morte possédant exactement trois voisines vivantes devient vivante.
       * Une cellule vivante possédant deux ou trois voisines vivantes reste vivante, sinon elle meurt
       */
      var newGridData = new Array(this.gridSize).fill(null);
      for (let i = 0; i < newGridData.length; i++) {
        newGridData[i] = new Array(this.gridSize).fill(false);
      }

      for (var i = 0; i < this.gridData.length; i++) {
        for (var j = 0; j < this.gridData.length; j++) {
          const neighbours = this.getNeighbours(i, j);
          const neighboursNumber = neighbours.filter((x) => x == true).length;

          if (this.gridData[i][j] == false && neighboursNumber == 3) {
            newGridData[i][j] = true;
          } else if (
            this.gridData[i][j] == true &&
            (neighboursNumber == 2 || neighboursNumber == 3)
          ) {
            newGridData[i][j] = true;
          } else {
            newGridData[i][j] = false;
          }
        }
      }
      if (this.gridData == newGridData) this.autoplay();
      this.gridData = newGridData;
      this.generationNumber++;
    },

    exportData() {
      var cellCoords = [];
      for (let i = 0; i < parseInt(this.gridSize); i++) {
        for (let j = 0; j < parseInt(this.gridSize); j++) {
          if (this.gridData[i][j] === true) {
            cellCoords.push(`${i},${j}`);
          }
        }
      }

      var data = new FormData();
      data.append("gridSize", this.gridSize);
      data.append("cellContent", cellCoords.join(";"));

      fetch(`${baseUrl}/export`, {
        method: "POST",
        body: data,
      })
        .then((response) => response.blob())
        .then((file) => {
          var a = document.createElement("a");
          a.href = URL.createObjectURL(file);
          a.setAttribute("download", "result.txt");
          a.click();
          a.remove();
        });
    },

    getNeighbours(x, y) {
      return [
        x - 1 < 0 || y + 1 >= this.gridSize
          ? false
          : this.gridData[x - 1][y + 1],
        x - 1 < 0 || y - 1 < 0 ? false : this.gridData[x - 1][y - 1],
        x - 1 < 0 ? false : this.gridData[x - 1][y],

        x + 1 >= this.gridSize || y + 1 >= this.gridSize
          ? false
          : this.gridData[x + 1][y + 1],

        x + 1 >= this.gridSize || y - 1 < 0
          ? false
          : this.gridData[x + 1][y - 1],
        x + 1 >= this.gridSize ? false : this.gridData[x + 1][y],
        y - 1 < 0 ? false : this.gridData[x][y - 1],
        y + 1 >= this.gridSize ? false : this.gridData[x][y + 1],
      ];
    },
  },
};
</script>
