import internal from 'stream';
import spinfo, {Preview as Spotify_Track} from 'spotify-url-info';
import ytinfo, { YoutubeSearchResults as Youtube_Query } from 'youtube-scrapper';
import { downloadOptions } from 'ytdl-core';
import ytdl from 'ytdl-core-discord';

/**
 * Converts duration in milliseconds to a hour:minute:second string.
 * @param duration in milliseconds
 * @returns 
 */
export function formatDuration(duration: number): string {
    let hours = Math.floor(duration / (1000 * 60 * 60));
    let mins = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    let secs = Math.floor(((duration % (1000 * 60 * 60)) % (1000 * 60)) / 1000);

    let hoursF = ((hours < 10) ? '0' : '') + hours.toString();
    let minsF = ((mins < 10) ? '0' : '') + mins.toString();
    let secsF = ((secs < 10) ? '0' : '') + secs.toString();

    return (hours > 0) ? `${hoursF}:${minsF}:${secsF}` : `${minsF}:${secsF}`;
}

/**
 * Formats given string into a code block.
 * @param str 
 * @returns 
 */
export function formatTextSyntax(str: string): string {
    return `\`\`\`elm\n${str.replaceAll(`'`, '`')}\`\`\``;
}

/**
 * Returns a playable stream from Youtube given a Spotify track url.
 * @param url 
 * @param options 
 * @returns 
 */
export async function spdl(url: string, options?: downloadOptions): Promise<internal.Readable> {
    let data: Spotify_Track | Youtube_Query;
    /* Get data - Spotify */
    data = await spinfo.getPreview(url);
    /* Get title */
    let title = `${data.artist} - ${data.title}`;
    /* Get data - Youtube */
    data = await ytinfo.search(title);
    /* Return stream */
    return ytdl(data.videos[0].url, options);
}