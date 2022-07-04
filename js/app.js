const app = angular.module("myApp", ['ngRoute']);
const urlAPI = "https://620f7068ec8b2ee2833fd2ef.mockapi.io/api/user";
// Route
app.config(function ($routeProvider) {
    $routeProvider
        .when('/', { templateUrl: 'pages/home.html' })
        .when('/ask', { templateUrl: 'pages/ask.html' })
        .when('/about', { templateUrl: 'pages/about.html' })
        .when('/contact', { templateUrl: 'pages/contact.html' })
        .when('/feedback', { templateUrl: 'pages/feedback.html' })
        .when("/admin", { templateUrl: "pages/admin.html" })
        .when('/courses', { templateUrl: 'pages/courses.html', controller: 'mySubject' })
        .when('/quiz/:id/:name', { templateUrl: 'pages/quiz.html', controller: 'quizsCtrl' })
});

// Tuỳ chỉnh
window.onunload = function () {
    sessionStorage.clear();
    localStorage.clear();
}


// Tài khoản
app.controller("myCtrl", function ($http, $scope, $rootScope) {
    $scope.dn = {};
    $scope.dk = {};
    $scope.dmk = {};
    $scope.mkMoi = {};
    $scope.pf = {};

    $rootScope.users = [];
    $rootScope.user;
    $http.get(urlAPI).then(function (reponse) {
        $rootScope.users = reponse.data;
    });

    // Đăng nhập tài khoản
    $scope.dangNhap = function () {
        $scope.flag = false;
        for (let i = 0; i < $rootScope.users.length; i++) {
            if ($rootScope.users[i].username == $scope.dn.username && $rootScope.users[i].password == $scope.dn.password) {
                $scope.flag = true;
                $rootScope.user = $rootScope.users[i].username;
                $rootScope.tenNguoiDung = $rootScope.users[i].fullname;
                // Quyền người dùng
                if ($rootScope.users[i].permission == "admin") {
                    $rootScope.permission = $rootScope.users[i].permission;
                }
            }
        }
        if ($scope.flag) {
            $scope.done = true;
            sessionStorage.setItem("user", JSON.stringify($rootScope.users));
            alert("Đăng nhập thành công!");
            $('#dangNhap').modal('hide');
            window.location.href = "#";
        } else {
            $scope.done = false;
            sessionStorage.setItem("user", null);
            alert("Mật khẩu không chính xác!");
        }
    };

    // Đăng ký tài khoản
    $scope.dangKy = function () {
        $scope.flag = false;
        $scope.password2;
        if ($scope.dk.password == $scope.password2) {
            $scope.flag = true;
            $http.post(urlAPI, $scope.dk).then(function (response) {
                $scope.users.push(response.data);
            });
        }
        if ($scope.flag) {
            alert("Đăng ký tài khoản thành công!");
            $('#dangKy').modal('hide');
            window.location.href = "#";
        } else {
            alert("Mật khẩu không khớp nhau!");
        }
    };

    // Quên mật khẩu
    $scope.quenMatKhau = function () {
        $scope.flag = false;
        $scope.index = 0;
        for (var i = 0; i < $scope.users.length; i++) {
            if ($scope.email == $scope.users[i].email) {
                $scope.flag = true;
                $scope.index = i;
            }
        }
        if ($scope.flag) {
            $scope.qmk = "Mật khẩu của bạn là: " + $scope.users[$scope.index].password;
        } else {
            $scope.qmk = "Bạn nhập sai email!";
        }
    };

    // Đổi mật khẩu
    $scope.doiMatKhau = function () {
        for (let i = 0; i < $rootScope.users.length; i++) {
            const urlId = urlAPI + "/" + i;
            $rootScope.user = $rootScope.users[i].username;
            if (
                $rootScope.users[i].username == $rootScope.user &&
                $rootScope.users[i].password == $scope.dmk.password1 &&
                $scope.dmk.password2 == $scope.mkMoi.password
            ) {
                $http.put(urlId, $scope.mkMoi).then(function (response) {
                    alert("Đổi mật khẩu thành công!");
                    $('#doiMatKhau').modal('hide');
                    window.location.href = "#";
                });
                return;
            } else if ($scope.dmk.password2 != $scope.mkMoi.password) {
                alert("Mật khẩu mới không khớp nhau!");
            } else if ($rootScope.users[i].password != $scope.dmk.password1) {
                alert("Mật khẩu cũ không đúng!");
            }
        }
    };

    // Cập nhật thông tin
    $scope.capNhatTK = function () {
        for (let i = 0; i < $rootScope.users.length; i++) {
            const urlId = urlAPI + "/" + i;
            if ($rootScope.user == $rootScope.users[i].username) {
                $http.put(urlId, $scope.pf);
                alert("Cập nhật thông tin thành công!");
                $('#taiKhoan').modal('hide');
                window.location.href = "#";
                return;
            }
        }
    };

    // Đăng xuất tài khoản
    $scope.dangXuat = function () {
        $rootScope.user = null;
        sessionStorage.clear();
        window.location.reload();
        alert("Đăng xuất thành công!");
    };
});

// Quiz
app.controller("quizsCtrl", function ($http, $scope, $rootScope, $routeParams, $interval) {
    // Lấy dữ liệu
    $http.get("js/db/Quizs/" + $routeParams.id + ".js").then(function (reponse) {
        questions = reponse.data;
    });
    // Tên bài quiz
    $scope.subjectName = $routeParams.name;
    // Bộ đếm thời gian 10 phút
    $scope.time = new Date();
    $scope.minitues = 10;
    $scope.seconds = 01;
    $interval(function () {
        $scope.time = new Date();
        if ($scope.seconds <= 0) {
            $scope.seconds = 59;
            $scope.minitues--;
        } else {
            $scope.seconds--;
        }
    }, 1000);
    // Bắt đầu
    $scope.start = function () {
        if ($rootScope.user == null) {
            alert("Vui lòng đăng nhập trước khi làm bài test");
        } else {
            Swal.fire({
                title: 'Bắt đầu thi?',
                text: "Bạn đã sẳn sàng làm bài!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Bắt đầu ngay',
                cancelButtonText: 'Quay lại'
            }).then((result) => {
                if (result.isConfirmed) {
                    $scope.id = 1;
                    $scope.quizOver = false;
                    $scope.inProgess = true;
                    $scope.getQuestion();
                }
            })
        }
    };
    // Làm lại
    $scope.reset = function () {
        $scope.inProgess = false;
        $scope.score = 0;
    };
    // Lấy câu hỏi
    $scope.getQuestion = function () {
        var quest = function (id) {
            var randomItem = questions[Math.floor(Math.random() * questions.length)];
            var count = questions.length;
            if (count > 10) {
                count = 10;
            }
            if (id < count) {
                return randomItem;
            } else {
                return false;
            }
        };
        var quiz = quest($scope.id);
        if (quiz) {
            $scope.question = quiz.Text;
            $scope.options = quiz.Answers;
            $scope.answer = quiz.AnswerId;
            $scope.answerMode = true;
        } else {
            $scope.quizOver = true;
        }
    }
    // Kiểm tra đáp án
    $scope.checkAnswer = function () {
        if (!$('input[name="answer"]:checked').length) return;
        var ans = $('input[name="answer"]:checked').val();
        if (ans == $scope.answer) {
            $scope.score++;
            $scope.correctAns = true;
        } else {
            $scope.correctAns = false;
        }
        $scope.answerMode = false;
    };
    $scope.ketThuc = function(){
        $scope.quizOver = true;
    }
    // Câu hỏi tiếp theo
    $scope.nextQuestion = function () {
        $scope.id++;
        $scope.getQuestion();
    }
    $scope.reset();
});

// Quản lý môn học
app.controller('mySubject', function ($http, $scope, $rootScope) {
    $scope.listSubject = [];
    $scope.monHoc;
    $scope.index = -1;
    $scope.pageSize = 3;
    $scope.start = 0;
    $http.get("js/db/Subjects.js").then(function (res) {
        $scope.listSubject = res.data;
    });

    // Sửa môn học
    $scope.edit = function (index) {
        $scope.index = index;
        $scope.monHoc = angular.copy($scope.listSubject[index]);
    };
    // Thêm môn học
    $scope.add = function () {
        $scope.listSubject.push(angular.copy($scope.monHoc));
        sweetalert1("Thêm mói");
        $scope.refesh();
    };
    //Cập nhật môn học
    $scope.update = function () {
        $scope.listSubject[$scope.index] = $scope.monHoc;
        sweetalert1("Cập nhật");
    };
    // Xoá môn học
    $scope.delete = function (index) {
        $scope.listSubject.splice(index, 1);
        sweetalert1("Xoá");
        $scope.refesh();
    };
    // Làm mới
    $scope.refesh = function () {
        $scope.monHoc = {};
        $scope.index = -1;
    };
    // Trước
    $scope.prev = function () {
        if ($scope.start > 0) {
            $scope.start -= $scope.pageSize;
        }
    }
    // Sau
    $scope.next = function () {
        if ($scope.start < $scope.listSubject.length - $scope.pageSize) {
            $scope.start += $scope.pageSize;
        }
    }
});

// Quản lý tài khoản
app.controller("myAccount", function ($http, $scope, $rootScope) {
    $scope.taiKhoan;
    // Sửa tài khoản
    $scope.edit = function (tk) {
        $scope.index = tk;
        $scope.taiKhoan = angular.copy($rootScope.users[tk]);
    };
    // Thêm tài khoản
    $scope.add = function () {
        $http.post(urlAPI, $scope.taiKhoan).then(function (response) {
            $scope.users.push(response.data);
            alert("Thêm mới thành công!");
            $scope.refesh();
            
        });
    };
    // Cập nhật tài khoản
    // $scope.update = function () {
    //     for (let i = 0; i < $rootScope.users.length; i++) {
    //         const apiUpdate = urlAPI + "/" + i;
    //         if ($rootScope.users[i].username == $scope.taiKhoan.username) {
    //             $http.put(apiUpdate, $scope.taiKhoan).then(function () {
    //                 alert("Cập nhật thành công!");
    //                 $scope.refesh();
    //             });
    //         }
    //     }
    // };
    $scope.update = function () {
        $scope.users[$scope.index] = angular.copy($scope.taiKhoan);
    }
    // Xoá tài khoản
    $scope.delete = function (tk) {
        for (let i = 0; i < $rootScope.users.length; i++) {
            const apiDelete = urlAPI + "/" + i;
            $http.delete(apiDelete).then(function () {
                $rootScope.users.splice(tk, 1);
                alert("Xóa thành công!");
                $scope.refesh();
            });
        }
    };
    // Làm mới
    $scope.refesh = function () {
        $scope.taiKhoan = {};
        $scope.index = -1;
    };
});