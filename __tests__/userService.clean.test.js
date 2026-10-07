const { UserService } = require('../src/userService');

const IDADE_MINIMA = 18;

describe('UserService - Suíte de Testes Limpa', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  describe('createUser', () => {
    test('deve gerar um id para o usuário criado', () => {
      // Arrange
      const nome = 'Fulano de Tal';
      const email = 'fulano@teste.com';
      const idade = 25;

      // Act
      const usuario = userService.createUser(nome, email, idade);

      // Assert
      expect(usuario.id).toBeDefined();
    });

    test('deve criar o usuário com status ativo', () => {
      // Arrange
      const nome = 'Fulano de Tal';
      const email = 'fulano@teste.com';
      const idade = 25;

      // Act
      const usuario = userService.createUser(nome, email, idade);

      // Assert
      expect(usuario.status).toBe('ativo');
    });

    test('deve aceitar usuário com exatamente a idade mínima', () => {
      // Arrange
      const idade = IDADE_MINIMA;

      // Act
      const usuario = userService.createUser('Limite', 'limite@teste.com', idade);

      // Assert
      expect(usuario.idade).toBe(IDADE_MINIMA);
    });

    test('deve lançar erro ao criar usuário menor de idade', () => {
      // Arrange
      const idade = IDADE_MINIMA - 1;

      // Act
      const criarMenor = () => userService.createUser('Menor', 'menor@teste.com', idade);

      // Assert
      expect(criarMenor).toThrow('O usuário deve ser maior de idade.');
    });

    test('deve lançar erro ao criar usuário sem nome', () => {
      // Arrange
      const nome = '';

      // Act
      const criarSemNome = () => userService.createUser(nome, 'semnome@teste.com', 30);

      // Assert
      expect(criarSemNome).toThrow('Nome, email e idade são obrigatórios.');
    });
  });

  describe('getUserById', () => {
    test('deve retornar o usuário correspondente ao id informado', () => {
      // Arrange
      const usuarioCriado = userService.createUser('Fulano de Tal', 'fulano@teste.com', 25);

      // Act
      const usuarioBuscado = userService.getUserById(usuarioCriado.id);

      // Assert
      expect(usuarioBuscado.nome).toBe('Fulano de Tal');
    });

    test('deve retornar null quando o id não existe', () => {
      // Arrange
      const idInexistente = 'id-inexistente';

      // Act
      const usuarioBuscado = userService.getUserById(idInexistente);

      // Assert
      expect(usuarioBuscado).toBeNull();
    });
  });

  describe('deactivateUser', () => {
    test('deve retornar true ao desativar um usuário comum', () => {
      // Arrange
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      const resultado = userService.deactivateUser(usuarioComum.id);

      // Assert
      expect(resultado).toBe(true);
    });

    test('deve alterar o status do usuário comum para inativo', () => {
      // Arrange
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      userService.deactivateUser(usuarioComum.id);

      // Assert
      const usuarioAtualizado = userService.getUserById(usuarioComum.id);
      expect(usuarioAtualizado.status).toBe('inativo');
    });

    test('deve retornar false ao tentar desativar um administrador', () => {
      // Arrange
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Act
      const resultado = userService.deactivateUser(usuarioAdmin.id);

      // Assert
      expect(resultado).toBe(false);
    });

    test('deve manter o administrador com status ativo', () => {
      // Arrange
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Act
      userService.deactivateUser(usuarioAdmin.id);

      // Assert
      const usuarioAtualizado = userService.getUserById(usuarioAdmin.id);
      expect(usuarioAtualizado.status).toBe('ativo');
    });

    test('deve retornar false quando o usuário não existe', () => {
      // Arrange
      const idInexistente = 'id-inexistente';

      // Act
      const resultado = userService.deactivateUser(idInexistente);

      // Assert
      expect(resultado).toBe(false);
    });
  });

  describe('generateUserReport', () => {
    test('deve incluir o título do relatório', () => {
      // Arrange
      userService.createUser('Alice', 'alice@email.com', 28);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('Relatório de Usuários');
    });

    test('deve incluir o nome de todos os usuários cadastrados', () => {
      // Arrange
      userService.createUser('Alice', 'alice@email.com', 28);
      userService.createUser('Bob', 'bob@email.com', 32);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('Alice');
      expect(relatorio).toContain('Bob');
    });

    test('deve incluir o id do usuário cadastrado', () => {
      // Arrange
      const usuario = userService.createUser('Alice', 'alice@email.com', 28);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain(usuario.id);
    });

    test('deve exibir o status inativo de um usuário desativado', () => {
      // Arrange
      const usuario = userService.createUser('Alice', 'alice@email.com', 28);
      userService.deactivateUser(usuario.id);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('inativo');
    });

    test('deve informar que não há usuários quando o banco está vazio', () => {
      // Arrange: banco já limpo pelo beforeEach

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('Nenhum usuário cadastrado.');
    });
  });
});
