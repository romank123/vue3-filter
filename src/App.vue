<script>
import MultiSelect from './components/multi-select/MultiSelect.vue'
import Datepicker from './components/datepicker/Datepicker.vue'
import RangeSlider from './components/range-slider/RangeSlider.vue'
import ProductCatalog from './components/ProductCatalog.vue'
import 'vue-slider-component/theme/antd.css'

export default {
  name: 'App',
  components: {
    MultiSelect,
    Datepicker,
    RangeSlider,
    ProductCatalog,
  },
  data() {
    return {}
  },
}
</script>

<template>
  <header>
    <div class="wrapper"></div>
  </header>

  <main>
    <div>Коммерческие помещения</div>
    <!-- певая строка фильтра -->
    <div class="first-line">
      <!-- номер аукциона  -->
      <label for="auction-number">
        <p>Номер аукциона</p>
        <input id="auction-number" type="text" />
      </label>

      <!-- субъект рф -->
      <label for="subject-rf">
        <p>Субъект РФ</p>
        <multi-select id="subject-rf"></multi-select>
      </label>

      <label for="project">
        <p>Проект</p>
        <!-- проект -->
        <multi-select id="project"></multi-select>
      </label>
    </div>

    <!-- вторая строка фильтра -->
    <div class="second-line">
      <label for="plannig-quarter">
        <p>планируемый квартал</p>
        <!-- планируемый квартал -->
        <multi-select id="plannig-quarter"></multi-select>
      </label>

      <div class="first-range">
        <label for="square">
          <p>площадь</p>
          <range-slider id="square" label=""></range-slider>
        </label>
      </div>

      <div class="second-range">
        <label for="costs">
          <p>стоимость</p>
          <range-slider id="costs" label=""></range-slider>
        </label>
      </div>
    </div>
    <product-catalog></product-catalog>
  </main>

  <footer class="footer"></footer>
</template>

<style lang="scss" scoped>
main {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.first-line {
  margin-top: 54px;
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.first-range {
  min-width: 230px;
}

.second-range {
  min-width: 230px;
}

.second-line {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}
</style>
