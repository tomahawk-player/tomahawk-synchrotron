var YoutubeResolver = Tomahawk.extend(TomahawkResolver,
{
    settings:
    {
            name: 'Youtube',
            weight: 70,
            timeout: 15
    },
    init: function() {
        String.prototype.capitalize = function(){
            return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
        };
    },
    decodeUrl: function (url) {
        // Some crazy replacement going on overhere! lol
        return url.replace(/%25252C/g, ",").replace(/%20/g, " ").replace(/%3A/g, ":").replace(/%252F/g, "/").replace(/%253F/g, "?").replace(/%252C/g, ",").replace(/%253D/g, "=").replace(/%2526/g, "&").replace(/%26/g, "&").replace(/%3D/g, "=");

    },
    parseVideoUrlFromYtPage: function (html) {
        var magic = "url_encoded_fmt_stream_map=";
        var magicFmt = "18";
        var magicLimit = "fallback_host";
        var pos = html.indexOf(magic) + magic.length;
        html = html.slice(pos);
        html = html.slice(html.indexOf(magicFmt + magicLimit) + (magic + magicLimit).length);
        finalUrl = html.slice(0, html.indexOf(magicLimit));
        return "http://o-o.preferred." + this.decodeUrl(finalUrl);
    },
    searchYoutube: function( qid, query, limit, title, artist ) {
        var apiQuery = "http://gdata.youtube.com/feeds/api/videos?q=" + query + "&v=2&alt=jsonc&quality=medium&max-results=" + limit;
        apiQuery = apiQuery.replace(/\%20/g, '\+');

        var that = this;
        Tomahawk.log("Doing async request:" + apiQuery + " title: " + title + " artist: " + artist + " qid: " + qid);
        Tomahawk.asyncRequest(apiQuery, function(xhr) {
            var myJsonObject = JSON.parse(xhr.responseText);
            if (myJsonObject.data.totalItems === 0){
		return;
	    }

            var count = limit;
            var results = [];
            for (i = 0; i < myJsonObject.data.totalItems && i < limit; i++) {
                // Need some more validation here
                // This doesnt help it seems, or it just throws the error anyhow, and skips?
                if(myJsonObject.data.items[i] === undefined){
                    continue;
		}
                if(myJsonObject.data.items[i].duration === undefined){
                    continue;
		}
		// Check whether the artist is in the title, discard otherwise -Thierry
		if (myJsonObject.data.items[i].title.search(new RegExp(artist, "gi")) === -1) {
			continue;
		}
                var result = new Object();
                if (artist !== "") {
                    result.artist = artist;
                }
                if (title !== "") {
                    result.track = title;
                } else {
                    result.track = myJsonObject.data.items[i].title;
                }

                //result.year = ;
                result.source = that.settings.name;
                result.mimetype = "video/h264";
                //result.bitrate = 128;
                result.duration = myJsonObject.data.items[i].duration;
                result.score = 0.85;
                var d = new Date(Date.parse(myJsonObject.data.items[i].uploaded));
                result.year = d.getFullYear();

                (function(i, qid, result) {
                    var xmlHttpRequest = new XMLHttpRequest();
                    xmlHttpRequest.open('GET', myJsonObject.data.items[i].player['default'], true);
                    xmlHttpRequest.onreadystatechange = function() {
                        if (xmlHttpRequest.readyState !== 4) {// We only care when the request is finished
                            return;
                        }

                        count = count - 1;
                        if (xmlHttpRequest.status == 200) {
                            result.url = that.parseVideoUrlFromYtPage(xmlHttpRequest.responseText);
                            if (result.url.indexOf("</body>") == -1 ) { // dumb check for bad parsing
                                results.push(result);
                            }
                        } else if (xmlHttpRequest.readyState === 4) {
                            Tomahawk.log("Failed to do GET request to: " + result.url);
                            Tomahawk.log("Status Code was: " + xmlHttpRequest.status);
                        }


                        if (count === 0) { // we're done
                            //Tomahawk.log("Sending results back to Tomahawk, with qid:" + qid + "and results:" + results);
                            var toReturn = {
                                results: results,
                                qid: qid
                            };
                            Tomahawk.addTrackResults(toReturn);
                        }
                    };
                    xmlHttpRequest.send(null);
                })(i, qid, result);
            }
        });
    },
    resolve: function(qid, artist, album, title)
    {
        if (artist !== "") {
            query = encodeURIComponent(artist) + "+";
        }
        if (title !== "") {
            query += encodeURIComponent(title);
        }
        Tomahawk.log("Resolving: " + qid + ": " + title + " - " + artist);
        this.searchYoutube(qid, query, 1, title, artist);
    },
    search: function( qid, searchString )
    {
        // First we get the artist name out of the search string with echonest's artist/extract function
        // HACK because Echo Nest is case-sensitive for artist/extract. we capitalize all words in the query just as a precaution. maybe a bad idea..
        // NOTE that this can often be slow, so the results can time out. However, Tomahawk can't deal with results without artists, so we *need an artist, so we try anyway
        var url = "http://developer.echonest.com/api/v4/artist/extract?api_key=JRIHWEP6GPOER2QQ6&format=json&results=1&sort=familiarity-desc&text=" + escape(searchString.capitalize());
        var that = this;
        Tomahawk.asyncRequest(url, function(xhr) {
            var response = JSON.parse(xhr.responseText).response;
            var artist = "";
            Tomahawk.log("Got echonest artist/extract response: " + xhr.responseText);
            if (response && response.artists && response.artists.length > 0) {
                artist = response.artists[1];
                that.searchYoutube(qid, searchString, 20, "", artist);
            }
        });
    }
});

Tomahawk.resolver.instance = YoutubeResolver;
