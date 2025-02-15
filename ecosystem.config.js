module.exports = {
  apps : [{
    name: "NomeDoSeuBot", // Dê um nome para o seu bot
    script: "index.js", // Nome do seu arquivo principal (ex: index.js ou bot.js)
    watch: false, // Define como false para evitar reinicializações em caso de alterações no código
    restart_delay: 1000, // Tempo (em milissegundos) para reiniciar o bot após um erro
    max_restarts: 10, // Número máximo de reinicializações
    // Você pode adicionar outras opções aqui, como variáveis de ambiente
    env: {
      NODE_ENV: "production"
    }
  }]
};