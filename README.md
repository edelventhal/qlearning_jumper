# Baby Mario Learns to Jump
### A simple Q-Learner algorithm for teaching an AI to jump between platforms

[Read about Q-Learning on Wikipedia](https://en.wikipedia.org/wiki/Q-learning)

Baby Mario will try to learn how to land on a target platform with a single jump.

The AI here has a 4-dimensional state space that makes up its "brain." The dimensions are:
* X delta between the start and goal
* Y delta between the start and goal
* X jump velocity
* Y jump velocity

In typical Q-learning fashion, the brain will go through all of the velocity options for a given delta between the start and goal platforms and find the X and Y jump velocity options that have the highest success value. That is, unless there is no good option, or if the epsilon (randomness) value is high, in which case it will try a random option (necessary for learning better options).

You can have it iterate multiple times to learn a whole lot at once. Every 1000 iterations (which is a single frame update), it will try a new platform so that it can learn a variety.

I made this thing in college years ago and just ported it to JS because it's cute, so don't judge. It really isn't great.

There are also variables like wind and such that I added in, for whatever reason. They don't really make any sense to have since they're not represented in the state space, so the AI can't possibly respond to them unless they remain constant. So... why have them? ¯\\_(ツ)_/¯

#### Possible improvements

* Use a lookup table for the Q-learner best result. It would be *significantly* faster and easy to implement.
* I never hooked up being able to change any of the variables from the web page. They're just empty fields right now.
* It would be a lot more fun if there was a training section and a performance section. The existing part is training, then performance would be an obstacle course.
* Would be good to control how often it changes platforms when you iterate over many frames, 1000 frames isn't enough to try every option.