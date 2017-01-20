install:
	cd .atomist ; yarn install ; yarn run build

build:
	cd .atomist ; yarn run build

test:
	cd .atomist ; yarn run test

demo:
	cd .atomist ; yarn run demo

demo-watch:
	cd .atomist ; yarn run demo-watch

edit:
	cd .atomist ; yarn edit $(editor) $(diff)
