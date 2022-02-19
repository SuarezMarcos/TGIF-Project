if(document.title === 'Home'){
    const read = document.querySelector('#readMoreLess');
    const content = document.querySelector('#history');
    read.onclick = () => {
        
        if(content.classList.contains('d-none')){
            read.textContent = 'Read less';
            content.classList.remove('d-none');
            window.scrollBy(0,300)
        } else {
            read.textContent = 'Read more';
            content.classList.add('d-none');
            window.scrollBy(0,-300)
        }
    }
} else {

    const states = document.querySelector('#dropdown');
    const tBody = document.querySelector('#t-body');
    const t_Body = document.querySelector('#atGlance');
    const least = document.querySelector('#least');
    const most = document.querySelector('#most');
    let democrat = document.querySelector('#inlineCheckbox1');
    let republican = document.querySelector('#inlineCheckbox2');
    let independent = document.querySelector('#inlineCheckbox3');
    let valueStates;
    let eventValue;
    let partyChecked;
    let arr = [];

    // EVENTS

    document.addEventListener('DOMContentLoaded', () => {

        document.title.includes("Senate" || "attendance-senate") ? fetchApi("Senate") : fetchApi("House");
        
    })

    if(document.title === 'House' || document.title === 'Senate'){
    
        states.addEventListener('change', e => {
            e.preventDefault();
            valueStates = e.target.value;
            filter();
        })
        
        democrat.addEventListener('change' , e => {
            e.preventDefault();
            eventValue = e.target.value
            partyChecked = e.target.checked
            filter();    
        })
        
        republican.addEventListener('change', e => {
            e.preventDefault();
            eventValue = e.target.value
            partyChecked = e.target.checked
            filter();
        })
        
        independent.addEventListener('change', e => {
            e.preventDefault();
            eventValue = e.target.value
            partyChecked = e.target.checked
            filter();
        })
    }

    // FUNCTIONS

    async function fetchApi(chamber) {
        const key = {
            headers: {
                "X-API-Key": "HkrsIM7n16Qw28YSGCLimzDJyIkg6RHR7mYwrxLX"
            }
        }

        try {
            const response = await fetch(`https://api.propublica.org/congress/v1/113/${chamber}/members.json`, key);
            const result = await response.json();
            members = [...result.results[0].members];

            if(document.title === 'House' || document.title === 'Senate'){
                loadHtml(members);
                loadStates();
            } else {
                atGlance();
                if(document.title === 'Attendance-House' || document.title === 'Attendance-Senate') {
                    engagedFilter()
                } else {     
                    loyaltyFilter();
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    function loadStates() {
        
        members.filter(member => {
            if(!arr.includes(member.state)){
                arr.push(member.state);
            }
        })
        arr.sort();
        arr.forEach(member => {
            const list = document.createElement('option');
            list.setAttribute('value', `${member}`);
            list.textContent =`${member}`;
            states.appendChild(list);
        })
    }

    function loadHtml(members) {
        cleanHtml();

        members.forEach(member => {
            const row = document.createElement('tr');
        
            const {first_name, middle_name, last_name,party, state, seniority, votes_with_party_pct, url} = member;
                
            row.innerHTML = `
                <td>
                <a href = "${url}" class = "text-decoration-none" target = "_blank" value = "${state}" rel = "noopener">  ${first_name } ${middle_name || ''} ${last_name} </a>
                </td>
                <td  class = 'text-center'> ${party}</td>
                <td  class = 'text-center'>${state}</td>
                <td  class = 'text-center'>${seniority}</td>
                <td  class = 'text-center'>${votes_with_party_pct}</td>
                `
                tBody.appendChild(row);
            })
    }

    function filter() {
        let result = members.filter(filterStates).filter(filterParty);

        if(result.length){
            loadHtml(result);
        } else {
            noResult();
        }
    }

    function filterStates(member) {
        
        if(valueStates === 'All') {
            return member;
        }
        if(valueStates) {
            return member.state === valueStates;
        }
        if(partyChecked) {
            return member.party;
        } else {
            return member;
        }
    }

    function filterParty(member) {

        let no = !republican.checked && !democrat.checked && !independent.checked;

        if(republican.checked && member.party === 'R' || democrat.checked && member.party === 'D' || independent.checked && member.party === 'ID' || no){
        return member;
    } 
    }  

    function noResult() {
        cleanHtml();
        let tRow = document.createElement('tr');
        const message = document.createElement('td');
        message.setAttribute('colspan', '5');
        message.classList.add('text-danger','text-center', 'fs-4');
        message.textContent = 'No senators matching your search';
        tRow.appendChild(message);
        tBody.appendChild(tRow);
    }

    function cleanHtml() {
        while(tBody.firstChild) {
            tBody.removeChild(tBody.firstChild);
        }
    }

    // STATISTICS

    function atGlance() {
        const reducer = (accumulator, curr) => accumulator + curr;
        const votes = [];
        
        const statistics = {
            democrats: [],
            republican: [],
            independent: [],
            pct_democrat: 0,
            pct_republican:0,
            pct_independent: 0,
            totalReps: 0,
            pctVotes:0
        }
        // Democrats
        statistics.democrats = members.filter(member => member.party === 'D').length;
        const democrat_votes = members.filter(member => member.party === 'D').map(member =>  member.votes_with_party_pct);
        statistics.pct_democrat = (democrat_votes.reduce(reducer) / statistics.democrats).toFixed(2)

        // Republicans
        statistics.republican = members.filter(member => member.party === 'R').length;
        const republican_votes = members.filter(member => member.party === 'R').map(member =>  member.votes_with_party_pct);
        statistics.pct_republican = (republican_votes.reduce(reducer) / statistics.republican).toFixed(2);

        // Independents
        if(document.title === "Attendance-Senate" || document.title === "Loyalty-Senate"){
            statistics.independent = members.filter(member => member.party === 'ID').length;
            const independent_votes = members.filter(member => member.party === 'ID').map(member => member.votes_with_party_pct);
            statistics.pct_independent = (independent_votes.reduce(reducer) / statistics.independent).toFixed(2);
        } else {
            statistics.independent = members.filter(member => member.party === 'ID').length;
        }
        // Total 
        statistics.totalReps = statistics.democrats + statistics.republican + statistics.independent;
        votes.push(parseFloat(statistics.pct_democrat), parseFloat(statistics.pct_republican), parseFloat(statistics.pct_independent))
        statistics.pctVotes = (votes.reduce(reducer) / 3).toFixed(2);

        const {democrats, pct_democrat, republican, pct_republican, independent, pct_independent, totalReps, pctVotes} = statistics;
        const showStat = new Glance(democrats, pct_democrat, republican, pct_republican, independent, pct_independent, totalReps, pctVotes);
    }

    class Glance {
        constructor(demo, pct_demo, rep, pct_rep, ind, pct_ind, totalReps, pctVotes){
            this.newTable(demo, pct_demo, rep, pct_rep, ind, pct_ind, totalReps, pctVotes);
        }
        newTable(democrats, pct_democrat, republican, pct_republican, independent, pct_independent, totalReps, pctVotes){
            this.cleanHtml();

            const tr_Democrats = document.createElement('tr');
            tr_Democrats.innerHTML =`
                <td>Democrats</td> <td class="text-center">${democrats}</td> <td class="text-center">${pct_democrat} %</td>
            `;

            const tr_Republicans = document.createElement('tr');
            tr_Republicans.innerHTML =`
                <td>Republicans</td> <td class="text-center">${republican}</td> <td class="text-center">${pct_republican} %</td>
            `;

            const tr_Independents = document.createElement('tr');
            tr_Independents.innerHTML =`
                <td>Independents</td> <td class="text-center">${independent}</td> <td class="text-center">${pct_independent} %</td>
            `;

            const tr_Total = document.createElement('tr');
            tr_Total.innerHTML =`
                <td>Total</td> <td class="text-center">${totalReps}</td> <td class="text-center">${pctVotes} %</td>
            `;

            t_Body.appendChild(tr_Democrats);
            t_Body.appendChild(tr_Republicans);
            t_Body.appendChild(tr_Independents);
            t_Body.appendChild(tr_Total);
        }

        cleanHtml(){
            while(t_Body.firstChild) {
                t_Body.removeChild(t_Body.firstChild);
            }
        }
    }

    function engagedFilter(){

        const statistics = {
            leastEngaged: [],
            mostEngaged: []
        }

        const stat = members.map(member => {
            let stat = {
                name: [],
                missed: [],
                pct_votes: []
            }
            stat.name = `<a href = "${member.url}" class = "text-decoration-none" target = "_blank" rel = "noopener">  ${member.first_name } ${member.middle_name || ''} ${member.last_name} </a>`;
            stat.missed = member.missed_votes;
            stat.pct_votes = member.missed_votes_pct
            
            return stat
        }) 
        statistics.leastEngaged = stat.sort((a,b) => a.pct_votes - b.pct_votes).slice(stat.length * 0.9).reverse() 
        statistics.mostEngaged = stat.sort((a,b) => a.pct_votes - b.pct_votes).slice(0,(-stat.length * 0.9));

        addTable(statistics.leastEngaged, statistics.mostEngaged);
    }

    function loyaltyFilter(){

        const statistics = {
            leastLoyal: [],
            mostLoyal: []
        }

        const stat = members.map(member => {
            let stat = {
                name: [],
                partyVotes: [],
                pct_votes: []
            }

            
            stat.name = `<a href = "${member.url}" class = "text-decoration-none" target = "_blank">  ${member.first_name } ${member.middle_name || ''} ${member.last_name} </a>`;
            stat.partyVotes = Math.round((member.total_votes - member.missed_votes) * (member.votes_with_party_pct) / 100);
            
            stat.pct_votes = member.votes_with_party_pct ;
            
            
            return stat;
        })
        
        statistics.leastLoyal =  stat.sort((a,b) => b.pct_votes - a.pct_votes).slice(stat.length * 0.9).reverse();
        statistics.mostLoyal = stat.sort((a,b) => a.pct_votes - b.pct_votes).slice(stat.length * 0.9).reverse();
        
        addTable(statistics.leastLoyal, statistics.mostLoyal);
    }

    function addTable(statistics_least, statistics_most){
        least.innerHTML = '';
        most.innerHTML = '';

        statistics_least.forEach(member => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${member.name}</td>
                <td class='text-center'>${(document.title.includes('Attendance') ? member.missed : member.partyVotes)}</td>
                <td class='text-center'>${member.pct_votes} %</td>
            `
            least.appendChild(row)
        })
        
        statistics_most.forEach(member => {
            const row = document.createElement('tr')
            row.innerHTML = `
                <td>${member.name}</td>
                <td class='text-center'>${(document.title.includes('Attendance') ? member.missed : member.partyVotes)}</td>
                <td class='text-center'>${member.pct_votes} %</td>
            `
            most.appendChild(row);
        })
    }
}

