import { default as Pusher } from 'pusher';

const pusher = new Pusher({
    appId: '1882140',
    key: '6965a7a014acee157364',
    secret: '7d37f9bd535dec97f976',
    cluster: 'ap1',
    useTLS: true,
});

const triggerPusherEvent = async (channel, event, data) => {
    return pusher.trigger(channel, event, data);
};

export { triggerPusherEvent };
