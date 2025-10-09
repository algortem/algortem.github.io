function page1() {
    document.querySelector('.page1').querySelector('button').addEventListener('click', function() {
        document.querySelector('.page1').animate(
            [
              { opacity: 1 },
              { opacity: 0 }
            ],
            {
              duration: 500,
              fill: "forwards"
            }
          ).finished.then(() => {
            document.querySelector('.page1').style.display = 'none'
            document.querySelector('.filler-page').style.display = 'flex'
            document.querySelector('.filler-page').animate(
                [
                    {opacity: 0},
                    {opacity: 1}
                ],
                {
                    duration: 500,
                    fill: "forwards"
                }
            ).finished.then(() => {
                document.querySelector('.filler-page').animate(
                    [
                        {opacity: 1},
                        {opacity: 0}
                    ],
                    {
                        duration: 500,
                        fill: "forwards"
                    }
                ).finished.then(() => {
                    document.querySelector('.filler-page').style.display = 'none' 
                    page2()
                })
            })
          })
    })
}

function page2() {
    document.querySelector('.page2').style.display = 'flex'
    document.querySelector('.page2').animate(
        [
            { opacity: 0 },
            { opacity: 1 }
        ],
        {
            duration: 500,
            fill: "forwards"
        }
    )
    let input = document.querySelector('.page2 input')
    let conditions = document.querySelector('.conditions')
    let current_condition = 0
    input.addEventListener('input', function() {
        if (current_condition == 0) {
            let p = input.value
            if (p != '') {
                conditions.addEventListener('wheel', e => e.preventDefault(), { passive: false });
                conditions.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
                conditions.scroll({
                    left: 300,
                    behavior: 'smooth'
                })
                current_condition += 1
            }
        }
        if (current_condition == 1) {
            let p = input.value
            if (p.length >= 8) {
                conditions.addEventListener('wheel', e => e.preventDefault(), { passive: false });
                conditions.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
                conditions.scroll({
                    left: 600,
                    behavior: 'smooth'
                })
                current_condition += 1
            }
        }
        if (current_condition == 2) {
            let p = input.value
            if (/\d/.test(p)) {
                conditions.addEventListener('wheel', e => e.preventDefault(), { passive: false });
                conditions.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
                // conditions.scroll({
                //     left: 900,
                //     behavior: 'smooth'
                // })
                page3()
            }
        }
    })
}

function page3() {
    document.querySelector('.page2').animate(
        [
            { opacity: 1 },
            { opacity: 0 }
        ],
        {
            duration: 500,
            fill: "forwards"
        }
    ).finished.then(() => {
        document.querySelector('.page2').style.display = 'none'
        document.querySelector('.page3').style.display = 'flex'
        document.querySelector('.page3').animate(
            [
                { opacity: 0 },
                { opacity: 1 }
            ],
            {
                duration: 500,
                fill: "forwards"
            }
        )
    })
}

page1()