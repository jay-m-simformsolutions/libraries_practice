const async = require('async')
const { Octokit } = require('@octokit/rest')

/* ====== parallel processing ======
gives result in collection like Array | Iterable | AsyncIterable | Object
*/
const stack = []
const obj = {}
const f1 = function(cb) {
    setTimeout(() => {
        cb(null,'1st result')
    }, 1000)
    // cb('1st err',null)
}
const f2 = function(cb) {
    setTimeout(() => {
        cb(null,'2nd result')
    }, 2000)
}
const f3 = function(cb) {
    setTimeout(() => {
        cb(null,'3rd result')
    }, 500)
}
stack.push(f1)
stack.push(f2)
stack.push(f3)

async.parallel(stack, function(err, results) {
    console.log(results)
})

obj.getName = function(cb) {
    const user = 'Jay'
    cb(null,user)
}
obj.getAge = function(cb) {
    const age = 20
    cb(null,age)
}
obj.getCollege = function(cb) {
    const clg = 'VGEC'
    cb(null,clg)
}
async.parallel(obj, function(err, results) {
    if(err){
        console.log(err)
        return
    }
    console.log(results);
})


/* ====== waterfall and series ======
    work with async await
*/

const githubAPI = new Octokit({
    version: '3.0.0'
})

// each fun inside array will need to take the result of the previous function as a parameter

async.waterfall([
    function getUserAvatar(cb){
        const q =  'jay-m-simformsolutions'
            githubAPI.search.users({ q: q }).then(response => {
                response
                // console.log(response.data);
                return response
            }).then(data => {
                // console.log(data);
                cb(null,data.data.items[0].avatar_url)
            }).catch(e => cb(e,null))
    },
    function wrapAvatar(avatarURL, cb){
        var avatar = `<img src="${avatarURL}" />`
        cb(null,avatar)
    }
], function(err, results){
    if(err){
        console.log(err)
        return
    }
    console.log(results)
})

/* ====== queue ======
    concurrent processing
    get list of objs from AWS S3 and where API has limit on number of items you can fetch at a time
*/
var _ = require('lodash');
const { result } = require('lodash')

//Generate an array of 10 random tasks;
var tasksList = _.times(10, _.uniqueId.bind(null, 'task_'));

var tasksQueue = async.queue(function (task, callback) {
    console.log('Performing task: ' + task.name);
    console.log('Waiting to be processed: ', tasksQueue.length());
    console.log('----------------------------------');

    //Simulate intensive processing
    setTimeout(function() {
    	// If you want to pass an error object here, it will be caught in the task handler
    	// callback('something went wrong');
    	callback(null,'done');
    }, 1100);

}, 2);

// When all is processed, drain is called
tasksQueue.drain = function() {
    console.log('all items have been processed.');
};

_.each(tasksList, function(task) {
	tasksQueue.push({name: task}, function(err,result) {
		//Done
		if (err) {
			console.log(err);
            return
		}
        console.log(result);
	});
});

//Puts a tasks in front of the queue
tasksQueue.unshift({name: 'Most important task'}, function(err,results) {
    if (err) {
        console.log(err);
    }
    console.log('results',results);
});


/* ====== whilist ======
    Whilst will execute the function fn while condition function returns true, it will call callback when the job is done or if any error occurs.
*/

var counter = 0;

//whilst(condition, fn, callback)

async.whilst(
	function testCondition(cb) {
        cb(null, counter < 10);
    },
	function increaseCounter(callback) {
		counter++;
		console.log('counter is now', counter);

		//Simulate ajax/processing
		//callback must be called once this function has completed, it takes an optional error argument
		setTimeout(() => callback(null,counter), 1000);
		//so if there's an error, you do callback(err) and it will immediately end.
		// setTimeout(() => callback('err',null), 1000);
	},
	function callback(err,results) {
		if (err) {
			console.log(err);
			return;
		}
        if(results){
            console.log('counter',results);
        }
		console.log('Job complete');
	}
);


/* ====== compose ======
 basically f(g(n)) composition functions
 //async.compose(fn1,fn2...)
 //This will make a composition out of the async functions passed in, each function will use the return value of the function that follows
 //So composing a(), b(), c() will produce a(b(c()))
*/

//Adds 5 to num
function addFive(num, callback) {
	callback(null, num + 5);
}

//Multiplies num by 10
function timesTen(num, callback) {
	callback(null, num * 10);
}

//Compose calculate(addFive(timesTen(5)))
var calculate = async.compose(addFive, timesTen);

calculate(5, function(err, result) {
	//What do you think result is equal to?
	console.log('compose',result);
});


//seq calculate(addFive(timesTen(5)))
var calculate = async.seq(addFive, timesTen);

calculate(5, function(err, result) {
	//What do you think result is equal to?
	console.log('sequence',result);
})


/* ====== reflectAll utils ======

*/

let tasks2 = [
    function(callback) {
        setTimeout(function() {
            callback(null, 'one');
        }, 200);
    },
    function(callback) {
        // do some more stuff but error ...
        callback(new Error('bad stuff happened'));
    },
    function(callback) {
        setTimeout(function() {
            callback(null, 'two');
        }, 100);
    }
];

async.parallel(async.reflectAll(tasks2),
// optional callback
function(err, results) {
    // values
    console.log(results);
    results[0].value = 'one'
    results[1].error = Error('bad stuff happened')
    results[2].value = 'two'
});

// an example using an object instead of an array
let tasks = {
    one: function(callback) {
        setTimeout(function() {
            callback(null, 'one');
        }, 200);
    },
    two: function(callback) {
        callback('two');
    },
    three: function(callback) {
        setTimeout(function() {
            callback(null, 'three');
        }, 100);
    }
};

async.parallel(async.reflectAll(tasks),
// optional callback
function(err, results) {
    // values
    console.log(results);
    results.one.value = 'one'
    results.two.error = 'two'
    results.three.value = 'three'
});
