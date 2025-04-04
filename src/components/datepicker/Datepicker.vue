<template>
	<article class="ds-datepicker" :class="colorTheme">
		<desktop-config
			v-if="!isMobile"
			v-bind="$props"
			@change-date="datepickerHandler"
		/>
		<mobile-config v-else v-bind="$props" @change-date="datepickerHandler" />
	</article>
</template>

<script>
import DesktopConfig from './DesktopConfig.vue'
import MobileConfig from './MobileConfig.vue'

export default {
	name: 'Datepicker',
	components: {
		DesktopConfig,
		MobileConfig,
	},
	props: {
		minDate: {
			type: String,
			default: '',
		},
		maxDate: {
			type: String,
			default: '',
		},
		colorTheme: {
			type: String,
			default: 'light',
		},
		isRange: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		isMobile() {
			return window.innerWidth < 768
		},
	},
	methods: {
		datepickerHandler(val, output) {
			if (!val) {
				this.$emit(
					'change-date',
					{
						date_from: null,
						date_to: null,
					},
					output
				)
				return
			}

			const options = {
				year: 'numeric',
				month: 'numeric',
				day: 'numeric',
			}

			if (val[1]) {
				this.$emit(
					'change-date',
					{
						date_from: val[0].toLocaleString('ru', options),
						date_to: val[1].toLocaleString('ru', options),
					},
					output
				)
				return
			}

			this.$emit(
				'change-date',
				{
					date_from: val[0].toLocaleString('ru', options),
					date_to: val[0].toLocaleString('ru', options),
				},
				output
			)
		},
	},
}
</script>

<style lang="scss">
@import './datepicker.scss';
</style>
