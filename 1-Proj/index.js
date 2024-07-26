//modulos externos
const inquirer = require("inquirer");
const chalk = require("chalk");

//modulos externos
const fs = require("fs");

operation();

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "Escolha opções abaixo:",
        choices: [
          "Criar Conta",
          "Consultar Saldo",
          "Depositar",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((resp) => {
      const action = resp["action"];
      if (action == "Criar Conta") {
        criarConta();
      } else if (action == "Consultar Saldo") {
        getSaldoConta();
      } else if (action == "Depositar") {
        depositar();
      } else if (action == "Sacar") {
        sacar();
      } else if (action == "Sair") {
        console.log(chalk.bgBlue.black("Obrigado por usar o Nu Banks"));
        process.exit();
      }
    })
    .catch((erro) => console.log(erro));
}

function criarConta() {
  console.log(chalk.bgGreen.black("Obrigado por escolher nosso banco."));
  console.log(chalk.green("Defina as opções de conta a seguir."));
  construirConta();
}

function construirConta() {
  inquirer
    .prompt([
      {
        name: "nomeConta",
        message: "Digite seu nome:",
      },
    ])
    .then((resp) => {
      const nomeConta = resp["nomeConta"];
      console.info(nomeConta);

      if (!fs.existsSync("contas")) {
        fs.mkdirSync("contas");
      }

      if (fs.existsSync("contas/" + nomeConta + ".json")) {
        console.log(
          chalk.bgRed.black("Esta conta já existee, escolha outro nome.")
        );
        construirConta();
        return;
      }

      fs.writeFileSync(
        "contas/" + nomeConta + ".json",
        '{"balance": 0}',
        function (erro) {
          console.log(erro);
        }
      );

      console.log(chalk.green("Conta criada com sucesso!!"));

      operation();
    })
    .catch((erro) => console.log(erro));
}

function depositar() {
  inquirer
    .prompt([
      {
        name: "nomeConta",
        message: "Qual nome de sua conta?",
      },
    ])
    .then((resp) => {
      const nomeConta = resp["nomeConta"];

      if (!verificaConta(nomeConta)) {
        return depositar();
      }

      inquirer
        .prompt([
          {
            name: "quantidade",
            message: "Quanto você quer depositar?",
          },
        ])
        .then((resp) => {
          const quantidade = resp["quantidade"];

          setConta(nomeConta, quantidade);
          operation();
        });
    })
    .catch((erro) => {
      console.log(erro);
    });
}

function verificaConta(nomeConta) {
  if (!fs.existsSync("contas/" + nomeConta + ".json")) {
    console.log(
      chalk.bgRed.black("Esta conta não existe, por favor escolha novamente")
    );
    return false;
  }
  return true;
}

function setConta(nomeConta, quantidade) {
  const conta = getConta(nomeConta);

  if (!conta) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!!")
    );
    return depositar();
  }

  conta.balance = parseFloat(quantidade) + parseFloat(conta.balance);

  fs.writeFileSync(
    "contas/" + nomeConta + ".json",
    JSON.stringify(conta),
    function (erro) {
      console.log(erro);
    }
  );

  console.log(
    chalk.green(
      "Foi depositado o valor de R$" +
        quantidade +
        "\n\rO valor total é: R$" +
        conta.balance
    )
  );
}

function getConta(nomeConta) {
  const contaJSON = fs.readFileSync("contas/" + nomeConta + ".json", {
    encoding: "utf-8",
    flag: "r",
  });

  return JSON.parse(contaJSON);
}

function getSaldoConta() {
  inquirer
    .prompt([
      {
        name: "nomeConta",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((resp) => {
      const nomeConta = resp["nomeConta"];

      if (!verificaConta(nomeConta)) {
        console.log(
          chalk.bgRed.black("Conta não existe, verifique e tente novamente!!")
        );
        return getSaldoConta();
      }

      const conta = getConta(nomeConta);

      console.log(chalk.bgBlue.black("Olá, seu saldo é R$" + conta.balance));

      operation();
    })
    .catch((erro) => {
      console.log(erro);
    });
}

function sacar() {
  inquirer
    .prompt([
      {
        name: "nomeConta",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((resp) => {
      const nomeConta = resp["nomeConta"];

      if (!verificaConta(nomeConta)) {
        console.log(
          chalk.bgRed.black("Conta não existe, verifique e tente novamente!!")
        );
        return getSaldoConta();
      }

      inquirer
        .prompt([
          {
            name: "quantidade",
            message: "Quanto você deseja sacar?",
          },
        ])
        .then((resp) => {
          const quantidade = resp["quantidade"];
          removerDinheiro(nomeConta, quantidade);
        })
        .catch((erro) => {
          console.log(erro);
        });
    })
    .catch((erro) => {
      console.log(erro);
    });
}

function removerDinheiro(nomeConta, quantidade) {
  const conta = getConta(nomeConta);

  if (!quantidade) {
    console.log(
      chalk.bgRed.black("Quantidade digitada incorretamente, tente novamente")
    );
    return sacar();
  }

  if (conta.balance < quantidade) {
    console.log(
      chalk.bgRed.black(
        "Valor indisponível para retirar!\r\nO máximo que pode ser retirado é R$" +
          conta.balance
      )
    );
    return sacar();
  }

  conta.balance = parseFloat(conta.balance) - parseFloat(quantidade);

  fs.writeFileSync(
    "contas/" + nomeConta + ".json",
    JSON.stringify(conta),
    function (erro) {
      console.log(erro);
    }
  );

  console.log(
    chalk.green("Foi realizado um saque de " + quantidade + " da sua conta.")
  );
  console.log(chalk.bgBlue.black("O saldo total atual é R$" + conta.balance));

  operation();
}
