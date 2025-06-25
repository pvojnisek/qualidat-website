# Futures Torunament

- **Official datasource**: https://onedrive.live.com/:x:/g/personal/6F253EF3AFCFE1C8/ETr-8_4vgD1HtQexExYSYLQBblKnufhY2qqn1TJ4B8KRQw?resid=6F253EF3AFCFE1C8!sfef3fe3a802f473db507b113161260b4&ithint=file%2Cxlsx&e=fHPEbF&migratedtospo=true&redeem=aHR0cHM6Ly8xZHJ2Lm1zL3gvYy82ZjI1M2VmM2FmY2ZlMWM4L0VUci04XzR2Z0QxSHRRZXhFeFlTWUxRQmJsS251ZmhZMnFxbjFUSjRCOEtSUXc_ZT1mSFBFYkY
This is the sheet where all match results are updated.

## Not working stuff (DON'T DO THESE)
- curl "https://onedrive.live.com/:x:/g/personal/6F253EF3AFCFE1C8/ETr-8_4vgD1HtQexExYSYLQBblKnufhY2qqn1TJ4B8KRQw?resid=6F253EF3AFCFE1C8!sfef3fe3a802f473db507b113161260b4&ithint=file%2Cxlsx&e=fHPEbF&migratedtospo=true&redeem=aHR0cHM6Ly8xZHJ2Lm1zL3gvYy82ZjI1M2VmM2FmY2ZlMWM4L0VUci04XzR2Z0QxSHRRZXhFeFlTWUxRQmJsS251ZmhZMnFxbjFUSjRCOEtSUXc_ZT1mSFBFYkY&download=1" -L -o filename.xlsx

Online results:

- **Direct access to results file**: https://feeds.kahunaevents.org/kahuna
This file contains data from different tournaments also. Tournaments can be identified by date. New results are inerted into the first row always. Reading the file in JavaScript should done using streaming with Fetch API.

- **Live results for humanes**:
  - https://www.irvinewaterpolo.org/tournaments-results
  - https://www.kahunaevents.org/cgi-bin/htmlos.cgi/events/event_select.htm
