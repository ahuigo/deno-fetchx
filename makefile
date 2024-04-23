msg?=

######################### test ################
.PHONY: test
test: 
	deno test -A
###################### pkg ##########################
.ONESHELL:
gitcheck:
	if [[ "$(msg)" = "" ]] ; then echo "Usage: make pkg msg='commit msg'";exit 20; fi

pkg: gitcheck test 
	{ hash newversion.py 2>/dev/null && newversion.py version;} ;  { echo version `cat version`; }
	git commit -am "$(msg)"
	v=`cat version` && git tag "$$v" && git push origin "$$v" && git push origin HEAD

