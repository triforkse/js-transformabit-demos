install:
	cd .atomist ; yarn install ; yarn run build

build:
	cd .atomist ; yarn run build

clean:
	rm -rf dist
	rm -rf .atomist/build
	rm -rf .atomist/node_modules

test:
	cd .atomist ; yarn run test

demo:
	cd .atomist ; yarn run demo

demo-watch:
	cd .atomist ; yarn run demo-watch

edit:
	cd .atomist ; yarn edit $(editor) $(diff)

link:
	cd .atomist ; ./link.sh
