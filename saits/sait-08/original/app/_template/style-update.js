{
	const body = document.querySelector('body')
	const styleUpdate = () => {
		body.insertAdjacentHTML(
			'beforeend',
			`
		<style>
			*, ::after, ::before {
				-webkit-transition:
								width 200ms linear,
								max-width 200ms linear,
								height 200ms linear,
								max-height 200ms linear,
								color 200ms linear,
								border 200ms linear,
								box-shadow 200ms linear,
								background 200ms linear,
								margin 200ms linear,
								padding 200ms linear,
								transform 200ms linear,
								opacity 200ms linear,
								left 200ms linear,
								top 200ms linear,
								bottom 200ms linear,
								right 200ms linear,
								z-index 200ms linear,
								fill 200ms linear;
				-moz-transition:
								width 200ms linear,
								max-width 200ms linear,
								height 200ms linear,
								max-height 200ms linear,
								color 200ms linear,
								border 200ms linear,
								box-shadow 200ms linear,
								background 200ms linear,
								margin 200ms linear,
								padding 200ms linear,
								transform 200ms linear,
								opacity 200ms linear,
								left 200ms linear,
								top 200ms linear,
								bottom 200ms linear,
								right 200ms linear,
								z-index 200ms linear,
								fill 200ms linear;
				-o-transition:
								width 200ms linear,
								max-width 200ms linear,
								height 200ms linear,
								max-height 200ms linear,
								color 200ms linear,
								border 200ms linear,
								box-shadow 200ms linear,
								background 200ms linear,
								margin 200ms linear,
								padding 200ms linear,
								transform 200ms linear,
								opacity 200ms linear,
								left 200ms linear,
								top 200ms linear,
								bottom 200ms linear,
								right 200ms linear,
								z-index 200ms linear,
								fill 200ms linear;
				-ms-transition:
								width 200ms linear,
								max-width 200ms linear,
								height 200ms linear,
								max-height 200ms linear,
								color 200ms linear,
								border 200ms linear,
								box-shadow 200ms linear,
								background 200ms linear,
								margin 200ms linear,
								padding 200ms linear,
								transform 200ms linear,
								opacity 200ms linear,
								left 200ms linear,
								top 200ms linear,
								bottom 200ms linear,
								right 200ms linear,
								z-index 200ms linear,
								fill 200ms linear;
				transition: width 200ms linear,
								max-width 200ms linear,
								height 200ms linear,
								max-height 200ms linear,
								color 200ms linear,
								border 200ms linear,
								box-shadow 200ms linear,
								background 200ms linear,
								margin 200ms linear,
								padding 200ms linear,
								transform 200ms linear,
								opacity 200ms linear,
								left 200ms linear,
								top 200ms linear,
								bottom 200ms linear,
								right 200ms linear,
								z-index 200ms linear,
								fill 200ms linear;
			}
		</style>
	`
		)
	}
	window.addEventListener('load', styleUpdate)
}
