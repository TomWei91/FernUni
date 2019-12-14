
function parseInputText(textForGeneration) {
    // ----------------- Lexer -----------------
    const createToken = chevrotain.createToken;
    const Lexer = chevrotain.Lexer;

    const Identifier = createToken({ name: "Identifier", pattern: /[a-zA-z]\w+/ })
    

    const DropDatabase = createToken({
        name: "DropDatabase",
        pattern: /DROP DATABASE IF EXISTS/,
        longer_alt: Identifier
    });

    const CreateDatabase = createToken({
        name: "CreateDatabase",
        pattern: /CREATE DATABASE/,
        longer_alt: Identifier
    });

    const Use = createToken({
        name: "Use",
        pattern: /USE/,
        longer_alt: Identifier
    });

    const DropTable = createToken({
        name: "DropTable",
        pattern: /DROP TABLE IF EXISTS/,
        longer_alt: Identifier
    });

    const CreateTable = createToken({
        name: "CreateTable",
        pattern: /CREATE TABLE/,
        longer_alt: Identifier
    });

    const Comment = createToken({
        name: "Comment",
        pattern: /COMMENT/,
        longer_alt: Identifier
    });

    const AlterTable = createToken({
        name: "AlterTable",
        pattern: /ALTER TABLE/,
        longer_alt: Identifier
    });

    const ForeignKey = createToken({
        name: "ForeignKey",
        pattern: /ADD CONSTRAINT FOREIGN KEY/,
        longer_alt: Identifier
    });

    const FK_ = createToken({
        name: "FK_",
        pattern: /FK_/,
        longer_alt: Identifier
    })

    const Constraint = createToken({
        name: "Constraint",
        pattern: /CONSTRAINT/,
        longer_alt: Identifier
    });

    const PrimaryKey = createToken({
        name: "PrimaryKey",
        pattern: /PRIMARY KEY/,
        longer_alt: Identifier
    });

    const PK_ = createToken({
        name: "PK_",
        pattern: /PK_/,
        longer_alt: Identifier
    })

    const References = createToken({
        name: "References",
        pattern: /REFERENCES/,
        longer_alt: Identifier
    });

    const Semicolon = createToken({
        name: "Semicolon",
        pattern: /;/
        //group: Lexer.SKIPPED
    });


    const OpenBracket = createToken({
        name: "OpenBracket",
        pattern: /\u0028/
    });

    const CloseBracket = createToken({
        name: "OpenBracket",
        pattern: /\u0029/
    });

    const Comma = createToken({
        name: "Comma",
        pattern: /,/,
        group: Lexer.SKIPPED
    });

    const NotNull = createToken({
        name: "NotNull",
        pattern: /NOT NULL/,
        group: Lexer.SKIPPED,
        longer_alt: Identifier
    });

    const Integer = createToken({
        name: "Integer",
        pattern: /INTEGER/,
        longer_alt: Identifier
    });

    const Varchar = createToken({
        name: "Varchar",
        pattern: /VARCHAR\u0028(\d)+\u0029/,
        longer_alt: Identifier
    });

    const Date = createToken({
        name: "Date",
        pattern: /DATE/,
        longer_alt: Identifier
    });

    const Time = createToken({
        name: "Time",
        pattern: /TIME/,
        longer_alt: Identifier
    });

    const Decimal = createToken({
        name: "Decimal",
        pattern: /DECIMAL/,
        longer_alt: Identifier
    });

    const Character = createToken({
        name: "Character",
        pattern: /(\w|\u0027|\u002D)+/
    });

    const WhiteSpace = createToken({
        name: "WhiteSpace", pattern: /\s+/,
        group: Lexer.SKIPPED,
        line_breaks: true
    });


    let SQLTokens = [
        WhiteSpace,        
        DropDatabase,
        CreateDatabase,
        Use,
        DropTable,
        CreateTable,
        OpenBracket,
        CloseBracket,
        Comment,
        AlterTable,
        ForeignKey,
        FK_,
        Constraint,
        PrimaryKey,
        PK_,
        References,
        Semicolon,
        Comma,
        NotNull,
        Integer,
        Varchar,
        Date,
        Time,
        Decimal,
        Character,
        Identifier
    ];

    let SQLLexer = new Lexer(SQLTokens);

    let SQLresultLexer = SQLLexer.tokenize(textForGeneration);

    //Check the Object with generated Tokens
    console.log(SQLresultLexer);




    // ----------------- parser -----------------


    const Parser = chevrotain.CstParser;

    class SQLParser extends Parser {
        constructor() {
            super(SQLTokens, { recoveryEnabled: true })


            //$ don't have to write everytime "this"
            const $ = this;


            // Rules for Table-Statement

            $.RULE("CreatTableStatement", () => {
                $.CONSUME(CreateTable);
                $.CONSUME(Character);
                $.SKIP_TOKEN(OpenBracket);
            });

            $.RULE("MetaType", () => {
                $.OR([
                    { ALT: () => $.CONSUME(Integer) },
                    { ALT: () => $.CONSUME(Varchar) },
                    { ALT: () => $.CONSUME(Date) },
                    { ALT: () => $.CONSUME(Time) },
                    { ALT: () => $.CONSUME(Decimal) }
                ]);

            });

            $.RULE("AttributesStatement", () => {
                $.MANY(() => {
                    $.CONSUME(Character);
                    $.SUBRULE($.MetaType);

                });
            });
            
            

            $.AllStatements = $.RULE("AllStatements", () => {
                $.SUBRULE($.CreatTableStatement);
                $.SUBRULE($.AttributesStatement);
            });


          
            // very important to call this after all the rules have been setup.
            $.performSelfAnalysis();
        };

    };

    const SQLParserInstance = new SQLParser(SQLresultLexer.tokens);
    //SQLParserInstance.input = SQLresultLexer.tokens;
    
    //Check
    console.log(SQLParserInstance);

    //Use Parser Methods and Generate Object + Check
    const SQLCST = SQLParserInstance.CreatTableStatement();
    console.log(SQLCST);


};
