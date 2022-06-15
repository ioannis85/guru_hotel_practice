# README


**Hi folks, this tutorial i explain  how to run app step by step**


## Prerequisites
- Visual studio code or your favorite code editor
- Node v16 or higher
- Docker Engine service
- Git
- [GuruHotel Internal tool](https://gitlab.com/guruhotel/backend-internal-tool-assesment  "GuruHotel Internal tool") 

one time, you completed with the prerequisites you can  follow the next steps.

## steps

- open your visual studio code terminal or your native terminal and run the next command.

`git clone  https://github.com/ioannis85/guru_hotel_practice.git/`

- next, you need install de GuruHotel Internal tool  with the next command.

`git clone https://gitlab.com/guruhotel/backend-internal-tool-assesment.git`

- then, you need execute the docker compose up  in your termina, inside GuruHotel Internal tool base code, and verify if project is running hitting http://localhost:5000

`docker compose up`

`http://localhost:5000  [into your favorite browser]`

- in your compturer, go to guru_hotel_practice project and open the docker-compose.yaml file  and edit enviroment service variables with the right value 

![image](https://user-images.githubusercontent.com/100004397/173916772-484f3a88-aa60-485a-a59e-194dba73a6d5.png)

- the final step is  execute  `docker compose up` command in your terminal, in order to verify if the graphql api is up you can hit `http://localhost:4000`





##NOTE:
  you can create users and roles in your db using the next command: `npm run seedData` this command create users, tokens and roles to test the graphql funtionality
  
  ![image](https://user-images.githubusercontent.com/100004397/173921010-e8d6260c-b6b6-4fb3-8f7d-e7f796301e35.png)

  
  


